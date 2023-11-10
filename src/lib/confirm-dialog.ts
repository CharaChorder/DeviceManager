import ConfirmDialog from "$lib/ConfirmDialog.svelte"

export async function askForConfirmation(
  title: string,
  message: string,
  confirmTitle: string,
  abortTitle: string,
): Promise<boolean> {
  const dialog = new ConfirmDialog({
    target: document.body,
    props: {
      title,
      message,
      confirmTitle,
      abortTitle,
    },
  })
  dialog.show()

  let resolvePromise: (value: boolean) => void
  const resultPromise = new Promise<boolean>(resolve => {
    resolvePromise = resolve
  })

  dialog.$on("abort", () => resolvePromise(false))
  dialog.$on("confirm", () => resolvePromise(true))

  const result = await resultPromise
  dialog.$destroy()

  return result
}
