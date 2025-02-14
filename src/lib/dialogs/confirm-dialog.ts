import ConfirmDialog from "$lib/dialogs/ConfirmDialog.svelte";
import { mount, unmount } from "svelte";
import type { Chord } from "$lib/serial/chord";

export async function askForConfirmation(
  title: string,
  message: string,
  confirmTitle: string,
  abortTitle: string,
  chord: Chord,
): Promise<boolean> {
  let resolvePromise: (value: boolean) => void;
  const resultPromise = new Promise<boolean>((resolve) => {
    resolvePromise = resolve;
  });

  const dialog = mount(ConfirmDialog, {
    target: document.body,
    props: {
      title,
      message,
      confirmTitle,
      abortTitle,
      chord,
      onabort: () => resolvePromise(false),
      onconfirm: () => resolvePromise(true),
    },
  });

  const result = await resultPromise;
  unmount(dialog);

  return result;
}
