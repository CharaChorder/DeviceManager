import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { page } from "vitest/browser";

const invoke = vi.fn();

vi.mock("@tauri-apps/api", () => ({
  invoke: (cmd: string, args?: unknown) => invoke(cmd, args),
}));

// importing the polyfill installs it onto navigator.serial
await import("./tauri-serial");

/**
 * The Tauri serial polyfill maps the Rust plugin's invoke commands onto a
 * Web-Serial-shaped API, with requestPort driving the picker dialog.
 */

const PORTS = [
  {
    name: "/dev/ttyUSB0",
    product: "CC2",
    usbVendorId: 0x303a,
    usbProductId: 0x8253,
  },
  {
    name: "/dev/ttyUSB1",
    product: "Other",
    usbVendorId: 1,
    usbProductId: 2,
  },
];

beforeEach(() => {
  invoke.mockImplementation(async (cmd: string) => {
    switch (cmd) {
      case "plugin:serial|get_serial_ports":
        return PORTS;
      case "plugin:serial|read":
        return [72, 73];
      default:
        return undefined;
    }
  });
});

afterEach(() => {
  for (const dialog of document.body.querySelectorAll("dialog")) {
    dialog.remove();
  }
});

describe("tauri serial polyfill", () => {
  it("lists ports through the plugin", async () => {
    const ports = await navigator.serial.getPorts();
    expect(invoke).toHaveBeenCalledWith(
      "plugin:serial|get_serial_ports",
      undefined,
    );
    expect(ports).toHaveLength(2);
    expect(ports[0]!.getInfo()).toMatchObject({
      usbVendorId: 0x303a,
      usbProductId: 0x8253,
    });
  });

  it("maps open/close onto plugin commands", async () => {
    const [port] = await navigator.serial.getPorts();
    if (!port) throw new Error("no ports listed");
    await port.open({ baudRate: 115200 });
    expect(invoke).toHaveBeenCalledWith("plugin:serial|open", {
      path: "/dev/ttyUSB0",
      baudRate: 115200,
    });

    await port.close();
    expect(invoke).toHaveBeenCalledWith("plugin:serial|close", {
      path: "/dev/ttyUSB0",
    });

    await port.forget();
  });

  it("reads bytes through the readable stream", async () => {
    const [port] = await navigator.serial.getPorts();
    if (!port) throw new Error("no ports listed");
    const reader = port.readable!.getReader();
    const { value } = await reader.read();
    expect(new TextDecoder().decode(value)).toBe("HI");
    reader.releaseLock();
  });

  it("writes bytes through the writable stream", async () => {
    const [port] = await navigator.serial.getPorts();
    if (!port) throw new Error("no ports listed");
    const writer = port.writable!.getWriter();
    await writer.write(new TextEncoder().encode("AB"));
    expect(invoke).toHaveBeenCalledWith("plugin:serial|write", {
      path: "/dev/ttyUSB0",
      chunk: [65, 66],
    });
    writer.releaseLock();
  });

  it("opens the picker dialog and resolves the chosen port", async () => {
    const openDialog = new MutationObserver(() => {
      const dialog = document.body.querySelector("dialog");
      if (dialog) {
        // the component renders a closed <dialog>; open it for the test
        dialog.setAttribute("open", "");
        openDialog.disconnect();
      }
    });
    openDialog.observe(document.body, { childList: true, subtree: true });

    const requested = navigator.serial.requestPort({
      filters: [{ usbVendorId: 0x303a }],
    });

    await expect
      .poll(() => document.body.querySelectorAll('input[type="radio"]').length)
      .toBe(1);
    // the non-matching port must not be offered
    expect(document.body.textContent).toContain("CC2");
    expect(document.body.textContent).not.toContain("Other");

    await page.getByRole("button", { name: "Ok" }).click();
    const port = await requested;
    expect(port.getInfo().name).toBe("/dev/ttyUSB0");
    openDialog.disconnect();
  }, 15_000);

  it("resolves undefined on cancel", async () => {
    const openDialog = new MutationObserver(() => {
      const dialog = document.body.querySelector("dialog");
      if (dialog) {
        dialog.setAttribute("open", "");
        openDialog.disconnect();
      }
    });
    openDialog.observe(document.body, { childList: true, subtree: true });

    const requested = navigator.serial.requestPort();
    await expect
      .poll(() => !!document.body.querySelector("button[onclick], button"))
      .toBe(true);
    await page.getByRole("button", { name: "Cancel" }).click();
    expect(await requested).toBeUndefined();
    openDialog.disconnect();
  }, 15_000);
});
