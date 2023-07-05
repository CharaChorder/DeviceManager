import {redirect} from "@sveltejs/kit"
import {base} from "$app/paths"

/** @type {import("./$types").PageLoad} */
export function load() {
  throw redirect(307, `${base}/config`)
}
