import type { PageLoad } from "./$types";
import type { DirectoryListing } from "./listing";

export const load = (async ({ fetch }) => {
  const result = await fetch(import.meta.env.VITE_FIRMWARE_URL);
  const data = await result.json();

  return { devices: data as DirectoryListing[] };
}) satisfies PageLoad;
