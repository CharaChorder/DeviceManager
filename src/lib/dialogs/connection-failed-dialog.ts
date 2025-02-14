import ConnectionFailed from "$lib/dialogs/ConnectionFailed.svelte";
import { mount, unmount } from "svelte";

export async function showConnectionFailedDialog(
  message: string,
): Promise<void> {
  let resolvePromise: (value: void) => void;
  const resultPromise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  const dialog = mount(ConnectionFailed, {
    target: document.body,
    props: {
      message,
      onclose: () => resolvePromise(),
    },
  });

  const result = await resultPromise;
  unmount(dialog);

  return result;
}
