<script lang="ts">
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
<p>Resetting might take <b>up to 2 Minutes</b>.</p>
{#each options as category, i}
  {#if i > 0}
    <hr />
  {/if}
  {#each category as [command, description]}
    <form
      onsubmit={(event) => {
        event.preventDefault();
        $serialPort?.reset(command);
        $serialPort = undefined;
      }}
    >
      <input
        type="text"
        placeholder={description}
        required
        pattern="^{description}$"
      />
      <button class="icon" type="submit">send</button>
    </form>
  {/each}
{/each}

<style lang="scss">
  hr {
    opacity: 0.25;
  }

  p {
    width: 22ch;
  }

  button.icon {
    opacity: 0.5;
    font-size: 20px;
  }

  form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  input[type="text"] {
    border: none;
    border-bottom: 1px solid transparent;
    background: none;
    width: fit-content;
    color: inherit;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--md-sys-color-outline);
    }
  }

  input[type="text"]:valid {
    color: var(--md-sys-color-error);

    & + button {
      opacity: 1;
      color: var(--md-sys-color-error);
    }
  }
</style>
