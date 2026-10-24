<script lang="ts">
  import { setting } from "$lib/setting";

  let {
    id = 0x15,
    type = "number",
    inverse = undefined,
    scale = undefined,
    min = undefined,
    max = undefined,
  }: {
    id?: number;
    type?: "number" | "checkbox" | "range" | "color";
    inverse?: number;
    scale?: number;
    min?: number;
    max?: number;
  } = $props();
</script>

<input {type} {min} {max} use:setting={{ id, inverse, scale }} />
