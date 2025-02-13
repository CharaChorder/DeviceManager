import type { RawVersionMeta, VersionMeta } from "./types/meta";
import type { Listing } from "./types/listing";
import type { KeymapCategory } from "./types/actions";
import { browser } from "$app/environment";

let lock: Promise<void> | undefined = undefined;

export async function getMeta(
  device: string,
  version: string,
  fetch: typeof window.fetch = window.fetch,
): Promise<VersionMeta | undefined> {
  while (lock) await lock;
  let resolveLock!: () => void;
  lock = new Promise((resolve) => (resolveLock = resolve));

  try {
    if (!browser) return fetchMeta(device, version, fetch);

    const dbRequest = indexedDB.open("version-meta", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      dbRequest.onsuccess = () => resolve(dbRequest.result);
      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onupgradeneeded = () => {
        const db = dbRequest.result;
        db.createObjectStore("meta", { keyPath: ["device", "version"] });
      };
    });

    try {
      const readTransaction = db.transaction(["meta"], "readonly");
      const store = readTransaction.objectStore("meta");
      const itemRequest = store.get([device, version]);
      const item = await new Promise<VersionMeta | undefined>((resolve) => {
        itemRequest.onsuccess = () => resolve(itemRequest.result);
        itemRequest.onerror = () => resolve(undefined);
      });

      if (item) return item;

      const meta = await fetchMeta(device, version);
      if (!meta) return undefined;

      const putTransaction = db.transaction(["meta"], "readwrite");
      const putStore = putTransaction.objectStore("meta");
      const putRequest = putStore.put(meta);
      await new Promise<void>((resolve, reject) => {
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      });
      putTransaction.commit();

      return meta;
    } finally {
      db.close();
    }
  } catch (error) {
    console.error(error);
  } finally {
    resolveLock();
    lock = undefined;
  }
  return undefined;
}

async function fetchMeta(
  device: string,
  version: string,
  fetch: typeof window.fetch = window.fetch,
): Promise<VersionMeta> {
  const path = `${import.meta.env.VITE_FIRMWARE_URL}/${device}/${version}`;
  const files: Listing[] = await fetch(`${path}/`).then((res) => res.json());
  const meta: Partial<RawVersionMeta> | undefined = files.some(
    (entry) => entry.type === "file" && entry.name === "meta.json",
  )
    ? await fetch(`${path}/meta.json`).then((res) => res.json())
    : undefined;

  return {
    version: meta?.version ?? version,
    device: meta?.target ?? device,
    date: new Date(meta?.git_date ?? files[0]?.mtime ?? ""),
    path,
    commit: meta?.git_commit ?? undefined,
    dirty: meta?.git_is_dirty ?? false,
    public: meta?.public_build ?? !version.includes("+"),
    developmentBuild: (meta?.development_mode ?? 0) === 1,
    factoryDefaults: meta?.factory_defaults
      ? {
          layout: await fetch(`${path}/${meta.factory_defaults.layout}`).then(
            (it) => it.json(),
          ),
          settings: await fetch(
            `${path}/${meta.factory_defaults.settings}`,
          ).then((it) => it.json()),
          chords: Object.fromEntries(
            await Promise.all(
              Object.entries(meta.factory_defaults.chords).map(
                async ([name, file]) => [
                  name,
                  await fetch(`${path}/${file}`).then((it) => it.json()),
                ],
              ),
            ),
          ),
        }
      : undefined,
    actions: await (meta?.actions
      ? fetch(`${path}/${meta.actions}`).then((it) => it.json())
      : Promise.all<KeymapCategory[]>(
          Object.values(import.meta.glob("$lib/assets/keymaps/*.yml")).map(
            async (load) => load().then((it) => (it as any).default),
          ),
        )),
    update: {
      uf2:
        meta?.update?.uf2 ??
        files.find(
          (entry) => entry.type === "file" && entry.name === "CURRENT.UF2",
        )?.name ??
        undefined,
      ota:
        meta?.update?.ota ??
        files.find(
          (entry) => entry.type === "file" && entry.name === "firmware.bin",
        )?.name ??
        undefined,
      esptool: meta?.update?.esptool ?? undefined,
    },
    spiFlash: meta?.spi_flash ?? undefined,
  };
}
