<script>
  import LL from "../i18n/i18n-svelte";
</script>

<dialog open>
  <h1>{$LL.browserWarning.TITLE()}</h1>
  <p>
    {$LL.browserWarning.INFO_SERIAL_PREFIX()}<a
      class="normal"
      target="_blank"
      href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility"
      >{$LL.browserWarning.INFO_SERIAL_INFIX()}</a
    >{$LL.browserWarning.INFO_SERIAL_SUFFIX()}
    {$LL.browserWarning.INFO_BROWSER_PREFIX()}
    <a
      href="https://github.com/brave/brave-browser/issues/13902"
      target="_blank">{$LL.browserWarning.INFO_BROWSER_INFIX()}</a
    >{$LL.browserWarning.INFO_BROWSER_SUFFIX()}
  </p>
  <div>
    <p>{$LL.browserWarning.DOWNLOAD_APP()}</p>
  </div>
</dialog>

<style lang="scss">
  dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100vw;
    height: 100vh;

    color: var(--md-sys-color-on-error);

    background: var(--md-sys-color-error);
    border: none;

    > * {
      max-width: 20cm;
    }
  }

  div {
    display: flex;
    gap: 16px;
  }

  a {
    color: var(--md-sys-color-on-error);
    text-decoration: underline;
  }

  div > p {
    display: flex;
    gap: 8px;
    align-items: center;
    list-style: none;
  }

  dialog::backdrop {
    opacity: 0.8;
    background: black;
  }

  h1 {
    color: inherit;
  }
</style>
