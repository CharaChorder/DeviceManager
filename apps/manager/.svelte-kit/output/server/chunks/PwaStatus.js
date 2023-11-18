import { c as create_ssr_component, a as subscribe } from "./ssr.js";
import { w as writable } from "./index2.js";
function registerSW(options = {}) {
  const {
    immediate = false,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  let wb;
  let registerPromise;
  let sendSkipWaitingMessage;
  const updateServiceWorker = async (_reloadPage = true) => {
    await registerPromise;
    {
      await sendSkipWaitingMessage?.();
    }
  };
  async function register() {
    if ("serviceWorker" in navigator) {
      const { Workbox } = await import("./workbox-window.prod.es5.js");
      wb = new Workbox("/sw.js", { scope: "/", type: "classic" });
      sendSkipWaitingMessage = async () => {
        await wb?.messageSkipWaiting();
      };
      {
        {
          let onNeedRefreshCalled = false;
          const showSkipWaitingPrompt = () => {
            onNeedRefreshCalled = true;
            wb?.addEventListener("controlling", (event) => {
              if (event.isUpdate)
                window.location.reload();
            });
            onNeedRefresh?.();
          };
          wb.addEventListener("installed", (event) => {
            if (typeof event.isUpdate === "undefined") {
              if (typeof event.isExternal !== "undefined") {
                if (event.isExternal)
                  showSkipWaitingPrompt();
                else
                  !onNeedRefreshCalled && onOfflineReady?.();
              } else {
                if (event.isExternal)
                  window.location.reload();
                else
                  !onNeedRefreshCalled && onOfflineReady?.();
              }
            } else if (!event.isUpdate) {
              onOfflineReady?.();
            }
          });
          wb.addEventListener("waiting", showSkipWaitingPrompt);
          wb.addEventListener("externalwaiting", showSkipWaitingPrompt);
        }
      }
      wb.register({ immediate }).then((r) => {
        if (onRegisteredSW)
          onRegisteredSW("/sw.js", r);
        else
          onRegistered?.(r);
      }).catch((e) => {
        onRegisterError?.(e);
      });
    }
  }
  registerPromise = register();
  return updateServiceWorker;
}
function useRegisterSW(options = {}) {
  const {
    immediate = true,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisteredSW,
    onRegisterError
  } = options;
  const needRefresh = writable(false);
  const offlineReady = writable(false);
  const updateServiceWorker = registerSW({
    immediate,
    onOfflineReady() {
      offlineReady.set(true);
      onOfflineReady?.();
    },
    onNeedRefresh() {
      needRefresh.set(true);
      onNeedRefresh?.();
    },
    onRegistered,
    onRegisteredSW,
    onRegisterError
  });
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker
  };
}
const PwaStatus_svelte_svelte_type_style_lang = "";
const css = {
  code: "button.svelte-9dwesr{cursor:pointer;color:var(--md-sys-color-on-background);background:transparent;border:none}",
  map: null
};
const PwaStatus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $needRefresh, $$unsubscribe_needRefresh;
  let $offlineReady, $$unsubscribe_offlineReady;
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW();
  $$unsubscribe_needRefresh = subscribe(needRefresh, (value) => $needRefresh = value);
  $$unsubscribe_offlineReady = subscribe(offlineReady, (value) => $offlineReady = value);
  $$result.css.add(css);
  $$unsubscribe_needRefresh();
  $$unsubscribe_offlineReady();
  return `${$needRefresh ? `<button title="Update ready" class="icon svelte-9dwesr" data-svelte-h="svelte-uwaep3">update</button>` : `${$offlineReady ? `<div title="App can now be used offline" class="icon" data-svelte-h="svelte-u4b4iq">offline_pin</div>` : ``}`}`;
});
export {
  PwaStatus as default
};
