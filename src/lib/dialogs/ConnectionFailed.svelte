<script lang="ts">
  import Dialog from "$lib/dialogs/Dialog.svelte";
  import LL from "$i18n/i18n-svelte";

  let {
    message,
    onclose,
  }: {
    message: string;
    onclose: () => void;
  } = $props();
</script>

<Dialog>
  {#if !navigator.serial}
    <h1>Incompatible Browser</h1>
    <p>Your browser does not support the Web Serial API.</p>
    <p>Supported browsers are any Chromium based Browsers, such as</p>
    <ul>
      <li>Google Chrome</li>
      <li>Microsoft Edge</li>
      <li>Opera</li>
      <li>Brave</li>
    </ul>
  {:else}
    <h1>Connection Failed</h1>
    <pre>{message}</pre>
    <h2>Troubleshooting Steps</h2>
    <ul>
      {#if navigator.userAgent.includes("Linux")}
        <li>
          <p>{@html $LL.deviceManager.LINUX_PERMISSIONS()}</p>
          <p>
            In most cases you can simply follow the <a
              target="_blank"
              href="https://docs.arduino.cc/software/ide-v1/tutorials/Linux#please-read"
              >Arduino Guide</a
            > on serial port permissions.
          </p>
          <p>Special systems:</p>
          <ul>
            <li>
              <a
                target="_blank"
                href="https://wiki.archlinux.org/title/Arduino#Accessing_serial"
                >Arch and Arch-based like Manjaro or EndeavourOS</a
              >
            </li>
            <li>
              <a
                target="_blank"
                href="https://gist.github.com/CMCDragonkai/d00201ec143c9f749fc49533034e5009?permalink_comment_id=4670311#gistcomment-4670311"
                >NixOS</a
              >
            </li>
            <li>
              <a
                target="_blank"
                href="https://wiki.gentoo.org/wiki/Arduino#Grant_access_to_non-root_users"
                >Gentoo</a
              >
            </li>
          </ul>
        </li>
      {/if}
      <li>
        You device may be pre-CCOS. refer to <a
          target="_blank"
          href="https://docs.charachorder.com/CCOS.html#upgrade-to-ccos"
          >Upgrade to CCOS</a
        > on how to upgrade your device.
      </li>
      <li>
        Some USB cables or hubs can cause issues, try directly connecting to a
        port on your computer with the included cable.
      </li>
    </ul>
  {/if}
  <div class="buttons">
    <button class="primary" onclick={onclose}>Close</button>
  </div>
</Dialog>

<style lang="scss">
  h1 {
    font-size: 2em;
    text-align: center;
    color: var(--md-sys-color-error);
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  pre {
    color: var(--md-sys-color-error);
  }

  a {
    display: inline;
    color: var(--md-sys-color-primary);
    padding: 0;
  }
</style>
