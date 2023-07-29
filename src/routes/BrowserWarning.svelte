<script>
  import LL from "../i18n/i18n-svelte"
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
    <a href="https://github.com/brave/brave-browser/issues/13902" target="_blank"
      >{$LL.browserWarning.INFO_BROWSER_INFIX()}</a
    >{$LL.browserWarning.INFO_BROWSER_SUFFIX()}
  </p>
  <div>
    <a href="https://www.chromium.org/getting-involved/download-chromium/" target="_blank" class="chrome"
      >{$LL.browserWarning.DOWNLOAD_CHROMIUM()}</a
    >
  </div>
  <h5>{$LL.browserWarning.OTHER_OPTIONS()}</h5>
  <div>
    <a href="https://www.google.com/chrome/" target="_blank" class="chrome">Chrome</a>
    <a href="https://www.microsoft.com/en-us/edge/download?form=MA13FJ" target="_blank" class="edge"
      >Microsoft Edge</a
    >
    <a href="https://www.opera.com/" target="_blank" class="opera">Opera</a>
    <a href="https://vivaldi.com/download/" class="vivaldi">Vivaldi</a>
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
  }

  div > a {
    display: flex;
    gap: 8px;
    align-items: center;
    list-style: none;

    &::before {
      content: "";

      display: inline-block;

      width: 24px;
      height: 24px;

      background: var(--md-sys-color-on-error);
    }

    &.chrome::before {
      mask: url("/browsers/googlechrome.svg");
    }

    &.edge::before {
      mask: url("/browsers/microsoftedge.svg");
    }

    &.opera::before {
      mask: url("/browsers/opera.svg");
    }

    &.vivaldi::before {
      mask: url("/browsers/vivaldi.svg");
    }
  }

  dialog::backdrop {
    opacity: 0.8;
    background: black;
  }

  h1 {
    color: inherit;
  }
</style>
