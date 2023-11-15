import {redirect} from "@sveltejs/kit"
import type {PageLoad} from "./$types"

export const load = (async ({url}) => {
  const newUrl = new URL(url)
  newUrl.pathname = "/config/"
  throw redirect(302, newUrl)
}) satisfies PageLoad
