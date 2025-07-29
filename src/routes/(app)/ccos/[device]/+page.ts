import type { PageLoad } from "./$types";
import type { DirectoryListing } from "$lib/meta/types/listing";
import { compare } from "semver";

export const load = (async ({ fetch, params }) => {
  const result = await fetch(
    `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/`,
  );
  const data = await result.json();

  return {
    versions: (data as DirectoryListing[]).sort((a, b) =>
      compare(b.name, a.name),
    ),
    device: params.device,
  };
}) satisfies PageLoad;
