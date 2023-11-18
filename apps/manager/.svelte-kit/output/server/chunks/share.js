import { a as readonly, w as writable } from "./index2.js";
const setCanShare = writable(false);
const canShare = readonly(setCanShare);
export {
  canShare as c
};
