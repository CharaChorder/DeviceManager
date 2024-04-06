<script lang="ts">
  import { serialPort } from "$lib/serial/connection";
  import { createEventDispatcher } from "svelte";

  export let challenge: string;

  let challengeInput = "";
  $: challengeString = `${challenge} ${$serialPort!.device}`;
  $: isValid = challengeInput === challengeString;

  const dispatch = createEventDispatcher();
</script>

<h3>Type the following to confirm the action</h3>

<p>{challengeString}</p>
<!-- svelte-ignore a11y-autofocus -->
<input
  autofocus
  type="text"
  bind:value={challengeInput}
  placeholder={challengeString}
/>

<button disabled={!isValid} on:click={() => dispatch("confirm")}
  >Confirm {challenge}</button
>

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
