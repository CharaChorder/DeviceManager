import { w as writable } from "./index2.js";
function persistentWritable(key, value, condition) {
  {
    return writable(value);
  }
}
const serialPort = writable();
const serialLog = writable([]);
const deviceChords = persistentWritable(
  "chord-library",
  []
);
const deviceLayout = persistentWritable(
  "layout",
  [[], [], []]
);
const deviceSettings = persistentWritable(
  "device-settings",
  []
);
const syncStatus = writable("done");
const syncProgress = writable(void 0);
export {
  serialPort as a,
  deviceChords as b,
  deviceLayout as c,
  deviceSettings as d,
  syncProgress as e,
  serialLog as f,
  persistentWritable as p,
  syncStatus as s
};
