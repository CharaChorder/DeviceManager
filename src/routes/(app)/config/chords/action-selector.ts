import ActionSelector from "$lib/components/layout/ActionSelector.svelte";
import { mount, unmount, tick } from "svelte";

export function selectAction(
  event: MouseEvent | KeyboardEvent,
  select: (action: number) => void,
  dismissed?: () => void,
) {
  const component = mount(ActionSelector, {
    target: document.body,
    props: {
      onclose: () => closed(),
      onselect: (action: number) => {
        select(action);
        closed();
      },
    },
  });
  const dialog = document.querySelector("dialog > div") as HTMLDivElement;
  const backdrop = document.querySelector("dialog") as HTMLDialogElement;
  const dialogRect = dialog.getBoundingClientRect();
  const groupRect = (event.target as HTMLElement).getBoundingClientRect();

  const scale = 0.5;
  const dialogScale = `${
    1 - scale * (1 - groupRect.width / dialogRect.width)
  } ${1 - scale * (1 - groupRect.height / dialogRect.height)}`;
  const dialogTranslate = `${scale * (groupRect.x - dialogRect.x)}px ${
    scale * (groupRect.y - dialogRect.y)
  }px`;

  const duration = 150;
  const options = { duration, easing: "ease" };
  const dialogAnimation = dialog.animate(
    [
      { scale: dialogScale, translate: dialogTranslate },
      { translate: "0 0", scale: "1" },
    ],
    options,
  );
  const backdropAnimation = backdrop.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    options,
  );

  async function closed() {
    dialogAnimation.reverse();
    backdropAnimation.reverse();

    await dialogAnimation.finished;

    unmount(component);
    await tick();
    dismissed?.();
  }
}
