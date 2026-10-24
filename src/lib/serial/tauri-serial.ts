import { invoke } from "@tauri-apps/api";
import { mount, unmount } from "svelte";
import TauriSerialDialog from "$lib/serial/TauriSerialDialog.svelte";

export type TauriSerialPort = Pick<
  SerialPort,
  "getInfo" | "open" | "close" | "readable" | "writable" | "forget"
>;

function NativeSerialPort(info: SerialPortInfo): TauriSerialPort {
  return {
    getInfo() {
      return info;
    },
    async open({ baudRate }: SerialOptions) {
      await invoke("plugin:serial|open", { path: info.name, baudRate });
    },
    async close() {
      await invoke("plugin:serial|close", { path: info.name });
    },
    async forget() {
      // noop
    },
    readable: new ReadableStream({
      async pull(controller) {
        const result = await invoke<number[]>("plugin:serial|read", {
          path: info.name,
        });
        controller.enqueue(new Uint8Array(result));
      },
    }),
    writable: new WritableStream({
      async write(chunk) {
        await invoke("plugin:serial|write", {
          path: info.name,
          chunk: Array.from(chunk),
        });
      },
    }),
  };
}

// the polyfill replaces navigator.serial (getter-only in Chromium ⇒
// defineProperty is the only portable assignment)
Object.defineProperty(navigator, "serial", {
  value: {
    async getPorts(): Promise<SerialPort[]> {
      return invoke<any[]>("plugin:serial|get_serial_ports").then((ports) =>
        ports.map(NativeSerialPort),
      ) as Promise<SerialPort[]>;
    },
    async requestPort(options?: SerialPortRequestOptions): Promise<SerialPort> {
      const ports = await navigator.serial.getPorts().then((ports) =>
        options?.filters !== undefined
          ? ports.filter((port) =>
              options.filters!.some(({ usbVendorId, usbProductId }) => {
                const info = port.getInfo();
                return (
                  (usbVendorId === undefined ||
                    info.usbVendorId === usbVendorId) &&
                  (usbProductId === undefined ||
                    info.usbProductId === usbProductId)
                );
              }),
            )
          : ports,
      );

      let resolvePort!: (port: SerialPort) => void;
      const dialogPromise = new Promise<SerialPort>(
        (resolve) => (resolvePort = resolve),
      );
      const dialog = mount(TauriSerialDialog, {
        target: document.body,
        props: {
          ports,
          onconfirm: (port) => resolvePort(port as SerialPort),
        },
      });
      const port = await dialogPromise;
      unmount(dialog);
      return port;
    },
  },
  configurable: true,
  writable: true,
});
