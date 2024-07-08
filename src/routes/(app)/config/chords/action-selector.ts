import ActionSelector from "$lib/components/layout/ActionSelector.svelte";
import { tick } from "svelte";

export function selectAction(
  event: MouseEvent | KeyboardEvent,
  select: (action: number) => void,
  dismissed?: () => void,
) {
  const component = new ActionSelector({ target: document.body });
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

    component.$destroy();
    await tick();
    dismissed?.();
  }

  component.$on("close", closed);
  component.$on("select", ({ detail }) => {
    select(detail);
    closed();
  });
}
