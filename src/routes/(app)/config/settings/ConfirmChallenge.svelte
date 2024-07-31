<script lang="ts">
  import { serialPort } from "$lib/serial/connection";

  let { challenge, onconfirm }: { challenge: string; onconfirm: () => void } =
    $props();

  let challengeInput = $state("");
  let challengeString = $derived(`${challenge} ${$serialPort!.device}`);
  let isValid = $derived(challengeInput === challengeString);
</script>

<h3>Type the following to confirm the action</h3>

<p>{challengeString}</p>
<!-- svelte-ignore a11y_autofocus -->
<input
  autofocus
  type="text"
  bind:value={challengeInput}
  placeholder={challengeString}
/>

<button disabled={!isValid} onclick={onconfirm}>Confirm {challenge}</button>

<style lang="scss">
  input[type="text"] {
    color: inherit;
    font-family: inherit;
    background: none;
    border: none;
    border-bottom: 1px solid currentcolor;
    width: 100%;

    &:focus {
      outline: none;
      border-color: var(--md-sys-color-secondary);
    }
  }

  button {
    color: var(--md-sys-color-error);
  }
</style>
