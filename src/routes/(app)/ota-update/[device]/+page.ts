import type { PageLoad } from "./$types";
import type { DirectoryListing } from "../listing";

export const load = (async ({ fetch, params }) => {
  const result = await fetch(
    `${import.meta.env.VITE_FIRMWARE_URL}/${params.device}/`,
  );
  const data = await result.json();

  return {
    versions: (data as DirectoryListing[]).sort((a, b) =>
      b.name.localeCompare(a.name),
    ),
    device: params.device,
  };
}) satisfies PageLoad;
