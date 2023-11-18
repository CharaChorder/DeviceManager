import { r as redirect } from "../../../chunks/index.js";
const load = () => {
  throw redirect(302, "/config/layout/");
};
export {
  load
};
