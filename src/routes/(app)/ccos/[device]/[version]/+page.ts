import type { PageLoad } from "./$types";
import { getMeta } from "$lib/meta/meta-storage";
import { error } from "@sveltejs/kit";

export const load = (async ({ fetch, params }) => {
  const meta = await getMeta(params.device, params.version, fetch);
  if (meta === undefined) {
    error(
      404,
      `The version ${params.version} for device ${params.device} does not exist.`,
    );
  }
  return { meta };
}) satisfies PageLoad;
