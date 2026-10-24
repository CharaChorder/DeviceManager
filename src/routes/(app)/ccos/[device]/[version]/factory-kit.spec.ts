import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { assembleFactoryKit, type VersionMetaWithEsptool } from "./factory-kit";

/**
 * The factory kit bundles the factory files, a generated flash script,
 * a README, and (on Windows) a downloaded esptool archive into one zip.
 * XMLHttpRequest is replaced with a scripted fake to keep this offline.
 */

const meta: VersionMetaWithEsptool = {
  device: "ZERO",
  version: "2.1.1",
  path: "https://meta.test/firmware/two_s3/2.1.1",
  update: {
    esptool: {
      chip: "esp32s3",
      baud: "921600",
      before: "default_reset",
      after: "hard_reset",
      flash_mode: "dio",
      flash_freq: "80m",
      flash_size: "4MB",
      files: {
        "0x1000": "CURRENT.UF2",
        "0x2000": "spiffs.bin",
      },
    },
  },
} as unknown as VersionMetaWithEsptool;

const responses = new Map<string, { status: number; body: unknown }>();

class FakeXHR {
  status = 404;
  statusText = "Not Found";
  response: unknown;
  onprogress: ((event: { loaded: number; total: number }) => void) | null =
    null;
  onload: (() => void) | null = null;
  #url = "";

  open(_method: string, url: string) {
    this.#url = url;
  }

  send() {
    const body = responses.get(this.#url);
    setTimeout(() => {
      if (body === undefined) {
        this.status = 404;
        this.statusText = "Not Found";
      } else {
        this.status = body.status;
        this.statusText = body.status === 200 ? "OK" : "Server Error";
        this.response = body.body;
      }
      this.onprogress?.({ loaded: 10, total: 10 });
      this.onload?.();
    }, 0);
  }
}

beforeEach(() => {
  responses.clear();
  responses.set("https://meta.test/firmware/two_s3/2.1.1/CURRENT.UF2", {
    status: 200,
    body: "firmware-bytes",
  });
  responses.set("https://meta.test/firmware/two_s3/2.1.1/spiffs.bin", {
    status: 200,
    body: "spiffs-bytes",
  });
  vi.stubGlobal("XMLHttpRequest", FakeXHR);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function unzip(blob: Blob) {
  const JSZip = (await import("jszip")).default;
  return JSZip.loadAsync(blob);
}

describe("assembleFactoryKit", () => {
  it("assembles a linux kit with flash script, readme, and files", async () => {
    const progress: number[] = [];
    const blob = await assembleFactoryKit(meta, "Linux", (it) =>
      progress.push(it),
    );
    expect(blob).toBeInstanceOf(Blob);

    const zip = await unzip(blob);
    expect(Object.keys(zip.files).sort()).toEqual([
      "CURRENT.UF2",
      "README.txt",
      "ZERO-2.1.1",
      "flash.sh",
      "spiffs.bin",
    ]);

    const script = await zip.file("flash.sh")!.async("string");
    expect(script).toContain("--chip esp32s3");
    expect(script).toContain("--baud 921600");
    expect(script).toContain("write_flash -z");
    expect(script).toContain("--flash_mode dio");
    expect(script).toContain("0x1000 CURRENT.UF2");
    expect(script).toContain("0x2000 spiffs.bin");
    expect(script).toContain("--port %1");

    const readme = await zip.file("README.txt")!.async("string");
    expect(readme).toContain("ZERO 2.1.1");
    expect(readme).toContain("Requires esptool");
    expect(readme).toContain("./flash.sh <port>");

    expect(await zip.file("CURRENT.UF2")!.async("string")).toBe(
      "firmware-bytes",
    );

    // linux: no esptool download → the 0.5 esptool weight stays 0
    expect(progress.at(-1)).toBeCloseTo(0.1 + 0.4, 5);
    const monotonic = progress.every(
      (it, i) => i === 0 || it >= progress[i - 1]!,
    );
    expect(monotonic).toBe(true);
  }, 30_000);

  it("bundles esptool and the windows scripts on windows", async () => {
    const JSZip = (await import("jszip")).default;
    const inner = new JSZip();
    inner.file("esptool-v5.2.0-windows-esptool/esptool.exe", "exe-bytes");
    inner.file("esptool-v5.2.0-windows-esptool/LICENSE", "license");
    responses.set("/esptool-v5.2.0-windows-amd64.zip", {
      status: 200,
      body: await inner.generateAsync({ type: "arraybuffer" }),
    });

    const progress: number[] = [];
    const blob = await assembleFactoryKit(meta, "Windows", (it) =>
      progress.push(it),
    );
    const zip = await unzip(blob);

    // esptool entries are re-rooted into an `esptool/` folder
    expect(Object.keys(zip.files)).toContain("esptool/esptool.exe");
    expect(Object.keys(zip.files)).toContain("esptool/LICENSE");
    expect(await zip.file("esptool/esptool.exe")!.async("string")).toBe(
      "exe-bytes",
    );

    const script = await zip.file("flash.bat")!.async("string");
    expect(script).toContain(".\\esptool\\esptool.exe");

    const ps1 = await zip.file("factory-flash.ps1")!.async("string");
    expect(ps1.length).toBeGreaterThan(0);

    const readme = await zip.file("README.txt")!.async("string");
    expect(readme).toContain("Run with PowerShell");
    expect(readme).not.toContain("Requires esptool");

    expect(progress.at(-1)).toBeCloseTo(1, 5);
  }, 30_000);

  it("rejects when a firmware file fails to download", async () => {
    responses.set("https://meta.test/firmware/two_s3/2.1.1/spiffs.bin", {
      status: 500,
      body: "",
    });
    await expect(assembleFactoryKit(meta, "Linux", () => {})).rejects.toThrow(
      /Failed to fetch/,
    );
  }, 30_000);
});
