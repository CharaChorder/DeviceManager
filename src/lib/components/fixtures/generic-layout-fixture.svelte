<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import GenericLayout from "$lib/components/layout/GenericLayout.svelte";
  import type { CompiledLayout } from "$lib/assets/layouts/layout.d.ts";

  let {
    layoutInfo,
    highlight = writable(new Set<number>()),
    highlightAction = writable(new Set<number>()),
  }: {
    layoutInfo: CompiledLayout;
    highlight?: Writable<Set<number>>;
    highlightAction?: Writable<Set<number>>;
  } = $props();

  setContext("visual-layout-config", {
    scale: 2,
    margin: 4,
    strokeWidth: 2,
    fontSize: 16,
    iconFontSize: 20,
    inactiveOpacity: 0.3,
    inactiveScale: 0.8,
  });
  setContext("highlight", highlight);
  setContext("highlight-action", highlightAction);
</script>

<GenericLayout {layoutInfo} />
