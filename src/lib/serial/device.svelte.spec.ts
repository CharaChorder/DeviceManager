import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canAutoConnect,
  CharaDevice,
  getName,
  getPortName,
  getViablePorts,
  PORT_FILTERS,
} from "$lib/serial/device";
import { stringifyChordActions, stringifyPhrase } from "$lib/serial/chord";
import { deviceFor, HANDSHAKE } from "../../../test/utils/mock-port";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CharaDevice handshake", () => {
  it("opens, probes and closes the port during init", async () => {
    const [device, port] = deviceFor();
    await device.init();
    // one open/close cycle for the initial probe, then wake() re-opens
    expect(port.openCount).toBeGreaterThanOrEqual(2);
    expect(port.closeCount).toBeGreaterThanOrEqual(1);
    expect(port.commands).toEqual(["VERSION", "ID"]);
  });

  it("parses identity fields from the ID reply", async () => {
    const [device] = deviceFor();
    await device.init();
    expect(device.version).toBe("3.1.0-beta.3");
    expect(device.company).toBe("CHARACHORDER");
    expect(device.device).toBe("ZERO");
    expect(device.chipset).toBe("WASM");
    expect(device.keyCount).toBe(256);
    expect(device.profileCount).toBe(3);
    expect(device.layerCount).toBe(4);
  });

  it.each([
    ["2.1.0", 1, 3],
    ["2.2.0-beta.4", 3, 3],
    ["2.2.0-beta.19", 3, 3],
    ["2.2.0-beta.20", 3, 4],
  ] as const)(
    "gates profiles/layers on version %s",
    async (version, profiles, layers) => {
      const [device] = deviceFor({
        VERSION: `VERSION ${version}`,
        ID: "ID CHARACHORDER TWO S3",
      });
      await device.init();
      expect(device.profileCount).toBe(profiles);
      expect(device.layerCount).toBe(layers);
    },
  );

  it("keeps single profile/layer counts on M0 chipsets", async () => {
    const [device] = deviceFor({
      VERSION: "VERSION 3.0.0",
      ID: "ID CHARACHORDER LITE M0",
    });
    await device.init();
    expect(device.profileCount).toBe(1);
    expect(device.layerCount).toBe(3);
    expect(device.keyCount).toBe(67);
  });
});

describe("CharaDevice.send framing", () => {
  it("strips the echoed command prefix and splits the answer", async () => {
    const [device] = deviceFor({ ...HANDSHAKE, FOO: "FOO bar baz" });
    await device.init();
    expect(await device.send(2, ["FOO"])).toEqual(["bar", "baz"]);
  });

  it("pads short replies with TOO_SHORT", async () => {
    const [device] = deviceFor({ ...HANDSHAKE, FOO: "FOO bar" });
    await device.init();
    expect(await device.send(3, ["FOO"])).toEqual([
      "bar",
      "TOO_SHORT",
      "TOO_SHORT",
    ]);
  });

  it("falls back to NO_RESPONSE on timeout", async () => {
    const [device] = deviceFor();
    await device.init();
    expect(await device.send(1, ["NEVER_ANSWER"], 20)).toEqual(["NO_RESPONSE"]);
  });

  it("waits without a timeout when asked to", async () => {
    const [device, port] = deviceFor({ ...HANDSHAKE, "QRY KEY": "QRY KEY 41" });
    await device.init();
    // the reply arrives with a delay, like a pending key report would
    setTimeout(() => port.respond("QRY KEY 41"), 10);
    expect(await device.queryKey()).toBe(41);
  });
});

describe("CharaDevice chord library", () => {
  const actions = [32, 51, 38];
  const phrase = [0x20, 0x71];
  const actionsHex = stringifyChordActions(actions);
  const phraseHex = stringifyPhrase(phrase);

  it("reads the chord count and progress", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      "CML C0": "CML C0 12",
      "CML C5": "CML C5 0.5",
    });
    await device.init();
    expect(await device.getChordCount()).toBe(12);
    expect(await device.getProgress()).toBe(0.5);
  });

  it("reads a chord by index", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      "CML C1 0": `CML C1 0 ${actionsHex} ${phraseHex} 0`,
    });
    await device.init();
    const chord = await device.getChord(0);
    expect(chord.actions.slice(0, 3)).toEqual(actions);
    expect(chord.phrase.slice(0, 2)).toEqual(phrase);
  });

  it("returns undefined for missing chords by value", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      [`CML C2 ${actionsHex}`]: `CML C2 ${actionsHex} 2`,
    });
    await device.init();
    expect(await device.getChordPhrase(actions)).toBeUndefined();
  });

  it("stores a chord and accepts the success status", async () => {
    const [device, port] = deviceFor({
      ...HANDSHAKE,
      [`CML C3 ${actionsHex} ${phraseHex}`]: `CML C3 ${actionsHex} ${phraseHex} 0`,
    });
    await device.init();
    await device.setChord({ actions, phrase });
    expect(port.commands).toContain(`CML C3 ${actionsHex} ${phraseHex}`);
  });

  it("rejects a stored chord failure", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      [`CML C3 ${actionsHex} ${phraseHex}`]: `CML C3 ${actionsHex} ${phraseHex} 2`,
    });
    await device.init();
    await expect(device.setChord({ actions, phrase })).rejects.toThrow(
      /status 2/,
    );
  });

  it("accepts deleted chords with status 2 (not found)", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      [`CML C4 ${actionsHex}`]: `CML C4 ${actionsHex} 2`,
    });
    await device.init();
    await expect(device.deleteChord({ actions })).resolves.toBeUndefined();
  });
});

describe("CharaDevice profiles", () => {
  it("round-trips layout keys", async () => {
    const [device, port] = deviceFor({
      ...HANDSHAKE,
      "VAR B4 A1 5 41": "VAR B4 A1 5 41 0",
      "VAR B3 A1 5": "VAR B3 A1 5 41 0",
    });
    await device.init();
    await device.setLayoutKey(0, 1, 5, 41);
    expect(await device.getLayoutKey(0, 1, 5)).toBe(41);
    expect(port.commands).toContain("VAR B4 A1 5 41");
  });

  it("encodes the profile into the setting id", async () => {
    const [device, port] = deviceFor({
      ...HANDSHAKE,
      "VAR B2 115 9": "VAR B2 115 9 0",
      "VAR B1 115": "VAR B1 115 9 0",
    });
    await device.init();
    // profile 1, setting 0x15 → 0x115
    await device.setSetting(1, 0x15, 9);
    expect(await device.getSetting(1, 0x15)).toBe(9);
    expect(port.commands).toContain("VAR B2 115 9");
    expect(port.commands).toContain("VAR B1 115");
  });

  it("rejects settings for unknown ids", async () => {
    const [device] = deviceFor({
      ...HANDSHAKE,
      "VAR B1 10": "VAR B1 10 0 2",
    });
    await device.init();
    await expect(device.getSetting(0, 0x10)).rejects.toThrow(/doesn't exist/);
  });

  it("commits profile data to flash", async () => {
    const [device, port] = deviceFor({ ...HANDSHAKE, "VAR B0": "VAR B0 0" });
    await device.init();
    await device.commit();
    expect(port.commands).toContain("VAR B0");
  });
});

describe("CharaDevice lifecycle commands", () => {
  it("sends reboot, bootloader and reset variants", async () => {
    const [device, port] = deviceFor({
      ...HANDSHAKE,
      RST: "RST",
      "RST BOOTLOADER": "RST BOOTLOADER 0",
      "RST FACTORY": "RST FACTORY 0",
      "RST CLEARCML": "RST CLEARCML 0",
    });
    await device.init();
    await device.reboot();
    await device.bootloader();
    await device.reset("FACTORY");
    await device.reset("CLEARCML");
    expect(port.commands).toEqual(
      expect.arrayContaining([
        "RST",
        "RST BOOTLOADER",
        "RST FACTORY",
        "RST CLEARCML",
      ]),
    );
  });

  it("parses the RAM query", async () => {
    const [device] = deviceFor({ ...HANDSHAKE, RAM: "RAM 1234" });
    await device.init();
    expect(await device.getRamBytesAvailable()).toBe(1234);
  });

  it("forgets and closes the port on request", async () => {
    const [device, port] = deviceFor();
    await device.init();
    await device.forget();
    await device.close();
    expect(port.forgetCount).toBe(1);
    expect(port.closeCount).toBeGreaterThanOrEqual(2);
  });
});

describe("CharaDevice OTA update", () => {
  it("streams the firmware image in chunks with progress", async () => {
    const [device, port] = deviceFor(HANDSHAKE);
    await device.init();

    const total = 300;
    const file = new Uint8Array(total).fill(0xab).buffer;
    let bytesReceived = 0;
    port.onBytes = (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived >= total) port.respond("OTA OK");
    };
    port.onCommand = (command) => {
      if (command === "RST OTA") port.respond("OTA READY");
      if (command === "RST RESTART") port.respond("RST RESTART 0");
    };

    const progress: [number, number][] = [];
    await device.updateFirmware(file, (done, tot) =>
      progress.push([done, tot]),
    );

    expect(progress).toEqual([
      [128, 300],
      [256, 300],
      [300, 300],
    ]);
    expect(port.commands).toEqual(
      expect.arrayContaining(["RST OTA", "RST RESTART"]),
    );
  });

  it("fails when the device reports an update failure", async () => {
    const [device, port] = deviceFor(HANDSHAKE);
    await device.init();
    port.onCommand = (command) => {
      if (command === "RST OTA") port.respond("OTA READY");
    };
    port.onBytes = () => port.respond("OTA FAILED");
    await expect(
      device.updateFirmware(new Uint8Array(8).buffer, () => {}),
    ).rejects.toThrow("OTA FAILED");
  });
});

describe("CharaDevice connection lifecycle", () => {
  it("suspends after the debounce and wakes on the next command", async () => {
    const [device, port] = deviceFor({ ...HANDSHAKE, "CML C0": "CML C0 1" });
    await device.init();

    expect(await device.getChordCount()).toBe(1);
    const opensAfterFirst = port.openCount;
    await vi.waitFor(() => expect(port.closeCount).toBeGreaterThan(1), {
      timeout: 2000,
    });

    expect(await device.getChordCount()).toBe(1);
    expect(port.openCount).toBeGreaterThan(opensAfterFirst);
  });

  it("exposes the port info", async () => {
    const [device] = deviceFor();
    expect(device.portInfo).toMatchObject({
      usbProductId: 0x8253,
      usbVendorId: 0x303a,
    });
  });
});

describe("port helpers", () => {
  it("maps aliases to marketing names", () => {
    expect(getName("one_m0")).toBe("CC1");
    expect(getName("M4G S3 (pre-production)")).toBe("M4G");
    expect(getName("unknown_chip")).toBe("unknown_chip");
  });

  it("names known ports and labels unknown ones", () => {
    const known = {
      getInfo: () => ({ usbProductId: 0x8253, usbVendorId: 0x303a }),
    };
    const unknown = { getInfo: () => ({ usbProductId: 1, usbVendorId: 2 }) };
    expect(getPortName(known as SerialPort)).toBe("CC2");
    expect(getPortName(unknown as SerialPort)).toContain("Unknown Device");
  });

  it("filters viable ports and enables auto-connect for exactly one", async () => {
    const filter = PORT_FILTERS.get("TWO S3")!;
    const port = (productId: number, vendorId: number) =>
      ({
        getInfo: () => ({ usbProductId: productId, usbVendorId: vendorId }),
      }) as SerialPort;
    const ports = [port(filter.usbProductId!, filter.usbVendorId!), port(1, 2)];
    const serial = { getPorts: async () => ports } as Serial;

    const viable = await getViablePorts(serial);
    expect(viable).toHaveLength(1);
    expect(await canAutoConnect(serial)).toBe(true);
    expect(
      await canAutoConnect({
        getPorts: async () =>
          ports.concat(port(filter.usbProductId!, filter.usbVendorId!)),
      } as Serial),
    ).toBe(false);
  });
});
