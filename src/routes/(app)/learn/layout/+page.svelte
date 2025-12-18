<script lang="ts">
  import { setContext } from "svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import type { VisualLayoutConfig } from "$lib/components/layout/visual-layout";
  import { writable, derived } from "svelte/store";
  import { layout } from "$lib/undo-redo";
  import Action from "$lib/components/Action.svelte";
  import { serialPort } from "$lib/serial/connection";

  let hasStarted = $state(false);

  setContext<VisualLayoutConfig>("visual-layout-config", {
    scale: 50,
    inactiveScale: 0.5,
    inactiveOpacity: 0.4,
    strokeWidth: 1,
    margin: 5,
    fontSize: 9,
    iconFontSize: 14,
  });

  const actions = derived(layout, (layout) => {
    const result = new Set<number>();
    for (const layer of layout) {
      for (const key of layer) {
        result.add(key[0].action);
      }
    }
    return [...result];
  });

  const currentAction = writable(0);

  const expected = derived(
    [layout, currentAction],
    ([layout, currentAction]) => {
      const result: Array<{ layer: number; key: number }> = [];
      for (let layer = 0; layer <= layout.length; layer++) {
        const layerArr = layout[layer];
        if (layerArr === undefined) {
          continue;
        }
        for (let key = 0; key <= layerArr.length; key++) {
          if (layerArr[key]?.[0].action === currentAction) {
            result.push({ layer, key });
          }
        }
      }
      return result;
    },
  );

  const highlight = derived(
    expected,
    (expected) => new Set(expected.map(({ key }) => key)),
  );

  const highlightAction = derived(
    currentAction,
    (currentAction) => new Set([currentAction]),
  );

  const currentLayer = writable(0);

  setContext("highlight", highlight);

  setContext("highlight-action", highlightAction);

  setContext("active-layer", currentLayer);

  async function next() {
    console.log("Next");
    const nextAction = $actions[Math.floor(Math.random() * $actions.length)];
    if (nextAction !== undefined) {
      currentAction.set(nextAction);
      currentLayer.set($expected[0]?.layer ?? 0);
      const key = await $serialPort?.queryKey();
      if ($expected.some(({ key: expectedKey }) => expectedKey === key)) {
        console.log("Correct", key);
      } else {
        console.log("Incorrect", key);
      }
      next();
    }
  }

  $effect(() => {
    if ($serialPort && $layout[0]?.[0] && !hasStarted) {
      hasStarted = true;
      next();
    }
  });
</script>

<section>
  <div class="challenge">
    <Action display="inline-keys" action={$currentAction}></Action>
  </div>

  <Layout />
</section>

<style lang="scss">
  .challenge {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100px;

    font-size: 24px;
  }

  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
  }
</style>
