import {redirect} from "@sveltejs/kit"
import type {PageLoad} from "./$types"

export const load = (({url}) => {
  const newUrl = new URL(url)
  newUrl.pathname = "/config/layout/"
  throw redirect(302, newUrl)
}) satisfies PageLoad
