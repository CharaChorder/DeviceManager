<dialog open>
  <h1>Warning</h1>
  <p>
    Your current browser is not supported. Due to this site's unique requirement for serial connections, we
    require the use of <b>desktop</b> versions of <b>Chromium-based</b> browsers.
  </p>
  <p>Popular options include</p>
  <div>
    <a href="https://www.chromium.org/getting-involved/download-chromium/" target="_blank" class="chrome"
      >Chromium</a
    >
    <a href="https://www.google.com/chrome/" target="_blank" class="chrome">Chrome</a>
    <a href="https://brave.com/" target="_blank" class="brave">Brave</a>
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
    display: flex;
    gap: 8px;
    align-items: center;

    color: var(--md-sys-color-on-error);
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

    &.brave::before {
      mask: url("/browsers/brave.svg");
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
