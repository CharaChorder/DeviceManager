import type { PageLoad } from "./$types";
import type { FileListing, Listing } from "../../listing";
import type { VersionMeta } from "./meta";

export const load = (async ({ fetch, params }) => {
  const result = await fetch(
    `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/${params.version}/`,
  );
  const data: Listing[] = await result.json();
  const meta: VersionMeta | undefined = data.some(
    (entry) => entry.type === "file" && entry.name === "meta.json",
  )
    ? await fetch(
        `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/${params.version}/meta.json`,
      ).then((res) => res.json())
    : undefined;

  return {
    meta: {
      version: meta?.version ?? params.version,
      target: meta?.target ?? params.device,
      path: `${import.meta.env.VITE_FIRMWARE_URL}${params.device}/${params.version}`,
      git_commit: meta?.git_commit ?? "",
      git_is_dirty: meta?.git_is_dirty ?? false,
      git_date: meta?.git_date ?? data[0]?.mtime ?? "",
      public_build: meta?.public_build ?? !params.version.startsWith("."),
      development_mode: meta?.development_mode ?? 0,
      update: {
        uf2:
          (data.find(
            (entry) =>
              entry.type === "file" &&
              entry.name === (meta?.update?.uf2 ?? "CURRENT.UF2"),
          ) as FileListing) ?? undefined,
        ota:
          data.find(
            (entry) =>
              entry.type === "file" &&
              entry.name === (meta?.update?.ota ?? "firmware.bin"),
          ) ?? undefined,
        esptool: meta?.update?.esptool ?? undefined,
      },
      files: data.filter(
        (entry) =>
          entry.type === "file" && (!meta?.files || entry.name in meta.files),
      ) as FileListing[],
    },
  };
}) satisfies PageLoad;
