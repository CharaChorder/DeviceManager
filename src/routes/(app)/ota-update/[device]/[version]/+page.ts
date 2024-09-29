import type { PageLoad } from "./$types";
import type { FileListing, Listing } from "../../listing";

export const load = (async ({ fetch, params }) => {
  const result = await fetch(
    `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/${params.version}/`,
  );
  const data: Listing[] = await result.json();

  return {
    uf2: data.find(
      (entry) => entry.type === "file" && entry.name === "CURRENT.UF2",
    ) as FileListing,
    ota: data.find(
      (entry) => entry.type === "file" && entry.name === "firmware.bin",
    ),
    version: params.version,
    device: params.device,
  };
}) satisfies PageLoad;
