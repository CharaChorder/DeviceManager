<script lang="ts">
  import ProgressButton from "$lib/ProgressButton.svelte";

  let {
    label,
    onclick,
    working,
    progress,
    error = undefined,
    disabled = false,
  }: {
    label: string;
    onclick: () => void;
    working: boolean;
    progress: number;
    error?: string;
    disabled?: boolean;
  } = $props();
</script>

<ProgressButton
  {onclick}
  {working}
  {progress}
  {error}
  {disabled}
  data-testid="progress-button"
>
  {label}
</ProgressButton>
