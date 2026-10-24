import type { PageLoad } from "./$types";
import { getMeta } from "$lib/meta/meta-storage";
import type { DirectoryListing } from "$lib/meta/types/listing";
import { previousMajorVersion } from "$lib/versioning";
import { error } from "@sveltejs/kit";

export const load = (async ({ fetch, params }) => {
  const meta = await getMeta(params.device, params.version, fetch);
  if (meta === undefined) {
    error(
      404,
      `The version ${params.version} for device ${params.device} does not exist.`,
    );
  }

  let previousMajor: string | undefined = undefined;
  try {
    const listing = await fetch(
      `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/`,
    );
    if (listing.ok) {
      const data = (await listing.json()) as DirectoryListing[];
      previousMajor = previousMajorVersion(
        data.map((it) => it.name),
        meta.version,
      );
    }
  } catch {
    // no suggestion if the listing is unavailable
  }

  return { meta, previousMajor };
}) satisfies PageLoad;
