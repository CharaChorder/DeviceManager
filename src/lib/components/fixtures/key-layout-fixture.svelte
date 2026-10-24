<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import KeyboardKey from "$lib/components/layout/KeyboardKey.svelte";
  import type { CompiledLayoutKey } from "$lib/assets/layouts/layout.d.ts";

  setContext("visual-layout-config", {
    scale: 2,
    margin: 4,
    strokeWidth: 2,
    fontSize: 16,
    iconFontSize: 20,
    inactiveOpacity: 0.3,
    inactiveScale: 0.8,
  });

  let {
    key,
    onclick = () => {},
    highlight = writable(new Set<number>()),
  }: {
    key: CompiledLayoutKey;
    onclick?: () => void;
    highlight?: Writable<Set<number>>;
  } = $props();

  setContext("highlight", highlight);
</script>

<svg data-testid="key-svg">
  <KeyboardKey {key} {onclick} onkeypress={() => {}} onfocusin={() => {}} />
</svg>
