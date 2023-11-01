<script>
  import {serialPort} from "$lib/serial/connection"
  import {setting} from "$lib/setting"
</script>

{#if $serialPort}
  <form>
    <fieldset>
      <legend><label><input type="checkbox" use:setting={{id: 41}} />Spurring</label></legend>
      <p>
        "Chording only" mode which tells your device to output chords on a press rather than a press &
        release. It also enables you to jump from one chord to another without releasing everything and can be
        activated in GTM or by chording both mirror keys. It can provide significant speed gains with
        chording, but also takes away the flexibility of character entry.
      </p>
      <p>Spurring also helps new users learn how to chord by eliminating the need to focus on timing.</p>
      <p>Spurring is toggled by chording both of the 'mirror' keys together.</p>
      <label
        >Character Counter Timeout<span class="unit"
          ><input type="number" step="0.001" min="0" max="240" use:setting={{id: 43, scale: 0.001}} />s</span
        ></label
      >
    </fieldset>

    <fieldset>
      <legend><label><input type="checkbox" use:setting={{id: 51}} />Arpeggiates</label></legend>
      <p>
        A quick, single key press and release used to indicate a suffix, prefix, or modifier to be associated
        with a chord.
      </p>
      <label
        >Tolerance<span class="unit"><input type="number" step="1" use:setting={{id: 54}} />ms</span></label
      >
    </fieldset>

    <fieldset>
      <legend><label><input type="checkbox" use:setting={{id: 12}} />Character Entry</label></legend>
      {#if $serialPort.device === "LITE"}
        <label>Swap Keymap 0 and 1<input type="checkbox" use:setting={{id: 13}} /></label>
      {/if}
      <label
        >Key Scan Rate<span class="unit"><input type="number" use:setting={{id: 14, inverse: 1000}} />Hz</span
        ></label
      >
      <label
        >Key Debounce Press<span class="unit"><input type="number" use:setting={{id: 15}} />ms</span></label
      >
      <label
        >Key Debounce Release<span class="unit"><input type="number" use:setting={{id: 16}} />ms</span></label
      >
      <label
        >Output Character Delay<span class="unit"><input type="number" use:setting={{id: 17}} />µs</span
        ></label
      >
    </fieldset>

    <fieldset>
      <legend><label><input type="checkbox" use:setting={{id: 21}} />Mouse</label></legend>
      <label
        >Mouse Speed<input type="number" use:setting={{id: 22}} /><input
          type="number"
          use:setting={{id: 23}}
        /></label
      >
      <label>Scroll Speed<input type="number" use:setting={{id: 25}} /></label>
      <label title="Bounces mouse by 1px every 60s if enabled"
        >Active Mouse<input type="checkbox" use:setting={{id: 24}} /></label
      >
      <label
        >Poll Rate<span class="unit"><input type="number" use:setting={{id: 26, inverse: 1000}} />Hz</span
        ></label
      >
    </fieldset>

    <fieldset>
      <legend><label><input type="checkbox" use:setting={{id: 31}} />Chording</label></legend>
      <label
        >Character Timeout <span class="unit"
          ><input type="number" min="0" max="25.5" step="0.1" use:setting={{id: 33, scale: 0.001}} />s</span
        ></label
      >
      <label
        >Detection Tolerance<span class="unit"
          ><input type="number" min="1" max="50" step="1" use:setting={{id: 34}} />ms</span
        ></label
      >
      <label
        >Release Tolerance<span class="unit"
          ><input type="number" min="1" max="50" step="1" use:setting={{id: 35}} />ms</span
        ></label
      >
      <label>Compound Chording<input type="checkbox" use:setting={{id: 61}} /></label>
    </fieldset>

    <fieldset>
      <legend><label>Device</label></legend>
      <label>Boot message<input type="checkbox" use:setting={{id: 93}} /></label>
      <label>Realtime Feedback<input type="checkbox" use:setting={{id: 92}} /></label>
      <label>
        Operating System
        <select>
          <option value="0">Windows</option>
          <option value="1">MacOS</option>
          <option value="2">Linux</option>
          <option value="3">iOS</option>
          <option value="4">Android</option>
          <option value="255">Unknown</option>
        </select>
      </label>
    </fieldset>

    {#if $serialPort.device === "LITE"}
      <!-- TODO -->
      <fieldset>
        <legend><label><input type="checkbox" />RGB</label></legend>
        <label>Brightness<input type="range" min="0" max="50" step="1" /></label>
        <label>Color</label>
        <label>Reactive Keys<input type="checkbox" /></label>
      </fieldset>
    {/if}
  </form>
{/if}

<style lang="scss">
  form {
    overflow: hidden;
    display: flex;
    flex-flow: row wrap;
    gap: 16px;
    justify-content: center;

    max-width: 30cm;
    margin-block: auto;
  }

  legend,
  legend > label {
    font-size: 24px;
    font-weight: bold;

    > input {
      font-size: 12px;
    }
  }

  fieldset {
    max-width: 400px;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 24px;

    &:has(> legend input:not(:checked)) > :not(legend) {
      pointer-events: none;
      opacity: 0.7;
    }

    > label {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;

      margin-block: 4px;

      font-size: 14px;

      &:has(input[type="number"]) {
        cursor: text;

        &:hover {
          filter: none;
        }
      }

      input[type="checkbox"] {
        font-size: 12px;
      }
    }

    .unit {
      overflow: hidden;
      display: flex;
      gap: 4px;
      align-items: center;
      justify-content: flex-start;

      width: 67px;
      padding-inline-end: auto;

      font-size: 12px;
      font-weight: bold;

      background: var(--md-sys-color-secondary-container);
      border-radius: 16px;
    }

    input[type="number"] {
      display: flex;

      width: 5ch;
      height: 100%;
      padding-block: 4px;

      font-family: "Noto Sans Mono", monospace;
      color: var(--md-sys-color-on-secondary);
      text-align: end;

      background: var(--md-sys-color-secondary);
      border: none;

      &::-webkit-inner-spin-button {
        display: none;
      }

      &::after {
        content: "bleh";
      }

      &:focus {
        filter: brightness(120%);
        outline: none;
      }
    }

    p {
      font-size: 10px;
    }
  }

  form label:has(:global(.pending-changes)) {
    color: var(--md-sys-color-tertiary);
  }
</style>
