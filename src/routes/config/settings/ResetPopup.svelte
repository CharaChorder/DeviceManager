<script lang="ts">
  import { confirmChallenge } from "./confirm-challenge";
  import { serialPort } from "$lib/serial/connection";

  const options = [
    [["FACTORY", "Factory Reset"]],
    [
      ["PARAMS", "Reset Settings"],
      ["KEYMAPS", "Reset Layout"],
      ["CLEARCML", "Clear Chords"],
    ],
    [
      ["STARTER", "Add starter chords"],
      ["FUNC", "Add functional chords"],
    ],
  ] as const;
</script>

<h3>Reset Device</h3>
{#each options as category, i}
  {#if i > 0}
    <hr />
  {/if}
  {#each category as [command, description]}
    <button
      class="error"
      use:confirmChallenge={{
        onConfirm() {
          $serialPort?.reset(command);
          $serialPort = undefined;
        },
        challenge: description,
      }}>{description}...</button
    >
  {/each}
{/each}

<style lang="scss">
  hr {
    opacity: 0.25;
  }
</style>
