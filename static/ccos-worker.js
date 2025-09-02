// @ts-check

/**
 * @typedef {import("../src/lib/ccos/ccos-events").CCOSInEvent} CCOSInEvent
 * @typedef {import("../src/lib/ccos/ccos-events").CCOSReadyEvent} CCOSReadyEvent
 * @typedef {import("../src/lib/ccos/ccos-events").CCOSReportEvent} CCOSReportEvent
 */

export class AsyncSemaphore {
  /** @type {Promise<unknown>} */
  last = Promise.resolve();

  /**
   * @template T
   * @param {() => T | Promise<T>} callback
   * @return {Promise<T>}
   */
  run(callback) {
    return new Promise((resolve, reject) => {
      this.last = this.last.finally(async () => {
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

const ccosFsPath = "/CCOS";

/** @type {any} */
let ccos;

const semaphore = new AsyncSemaphore();

/**
 * @param {MessageEvent<CCOSInEvent>} event
 */
self.addEventListener("message", async (event) => {
  switch (event.data.type) {
    case "init": {
      const url = event.data.url;
      await semaphore.run(() => init(url));
      break;
    }
    case "press": {
      const code = event.data.code;
      await semaphore.run(() => keyPress(code));
      break;
    }
    case "release": {
      const code = event.data.code;
      await semaphore.run(() => keyRelease(code));
      break;
    }
    case "serial": {
      await semaphore.run(() => serialWrite(event.data.data));
    }
  }
});

/**
 * @param {string} url
 */
async function init(url) {
  if (ccos) {
    console.warn("CCOS is already initialized.");
    return;
  }

  ccos = await import(/* @vite-ignore */ url).then((it) => it.default());

  await ccos.FS.mkdir(ccosFsPath);
  await ccos.FS.mount(
    ccos.FS.filesystems.IDBFS,
    { autoPersist: true },
    ccosFsPath,
  );

  await /** @type {Promise<void>} */ (
    new Promise(async (resolve) => {
      await ccos.FS.syncfs(true, (/** @type {any} */ err) => {
        if (err) {
          console.error(err);
        }
      });
      resolve();
    })
  );

  const onReport = ccos.addFunction(
    /**
     * @param {number} modifiers
     * @param {...number} keys
     */
    (modifiers, ...keys) => {
      /** @type {CCOSReportEvent} */
      const msg = { type: "report", modifiers, keys };
      self.postMessage(msg);
    },
    "viiiiiiiiiiiii",
  );
  const onSerial = ccos.addFunction(
    /**
     * @param {number} data
     */
    (data) => {
      /** @type {CCOSInEvent}) */
      const msg = { type: "serial", data };
      self.postMessage(msg);
    },
    "vi",
  );

  ccos._init(onReport, onSerial);

  async function update() {
    if (ccos) {
      await semaphore.run(() => ccos.update());
    }
    requestAnimationFrame(update);
  }
  update();

  /** @type {CCOSReadyEvent} */
  const readyMsg = { type: "ready" };
  self.postMessage(readyMsg);
}

/**
 * @param {number} data
 */
async function serialWrite(data) {
  if (!ccos) {
    console.warn("Serial write ignored, CCOS is not initialized.");
    return;
  }
  await ccos.serialWrite(data);
}

/**
 * @param {number} code
 */
async function keyPress(code) {
  if (!ccos) {
    console.warn("Key press ignored, CCOS is not initialized.");
    return;
  }
  await ccos.addPressedKey(code);
}

/**
 * @param {number} code
 */
async function keyRelease(code) {
  if (!ccos) {
    console.warn("Key release ignored, CCOS is not initialized.");
    return;
  }
  await ccos.removePressedKey(code);
}
