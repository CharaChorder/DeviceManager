<script lang="ts">
  import {browser, version} from "$app/environment"
  import {action} from "$lib/title"
  import LL, {setLocale} from "../i18n/i18n-svelte"
  import {theme} from "$lib/preferences.js"
  import type {Locales} from "../i18n/i18n-types"
  import {detectLocale, locales} from "../i18n/i18n-util"
  import {loadLocaleAsync} from "../i18n/i18n-util.async"
  import {tick} from "svelte"
  import SyncOverlay from "./SyncOverlay.svelte"

  let locale = (browser && (localStorage.getItem("locale") as Locales)) || detectLocale()
  $: if (browser)
    (async () => {
      localStorage.setItem("locale", locale)
      await loadLocaleAsync(locale)
      setLocale(locale)
    })()

  function switchTheme() {
    const mode = $theme.mode === "light" ? "dark" : "light"
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        $theme.mode = mode
        await tick()
      })
    } else {
      $theme.mode = mode
    }
  }

  let languageSelect: HTMLSelectElement
</script>

<footer>
  <ul>
    <li>
      <!-- svelte-ignore not-defined -->
      <a href={import.meta.env.VITE_HOMEPAGE_URL} rel="noreferrer" target="_blank"
        ><span class="icon">commit</span> v{version}</a
      >
    </li>
    <li>
      <a href={import.meta.env.VITE_BUGS_URL} rel="noreferrer" target="_blank"
        ><span class="icon">bug_report</span> File an issue</a
      >
    </li>
  </ul>

  <SyncOverlay />

  <ul>
    <li>
      <input use:action={{title: $LL.profile.theme.COLOR_SCHEME()}} type="color" bind:value={$theme.color} />
    </li>
    <li>
      {#if $theme.mode === "light"}
        <button use:action={{title: $LL.profile.theme.DARK_MODE()}} class="icon" on:click={switchTheme}>
          dark_mode
        </button>
      {:else if $theme.mode === "dark"}
        <button use:action={{title: $LL.profile.theme.LIGHT_MODE()}} class="icon" on:click={switchTheme}>
          light_mode
        </button>
      {/if}
    </li>
    <li>
      <button
        class="icon"
        use:action={{title: $LL.profile.LANGUAGE()}}
        on:click={() => languageSelect.click()}
        >translate

        <select bind:value={locale} bind:this={languageSelect}>
          {#each locales as code}
            <option value={code}>{code}</option>
          {/each}
        </select>
      </button>
    </li>
  </ul>
</footer>

<style lang="scss">
  select {
    position: absolute;
    opacity: 0;
  }

  input[type="color"] {
    cursor: pointer;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    inline-size: 20px;
    block-size: 20px;
    margin: 0;
    padding: 0;

    color: inherit;

    background: transparent;
    border: none;
    border-radius: 50%;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
    }
  }

  footer {
    position: absolute;
    bottom: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;
    padding: 16px;

    opacity: 0.4;
  }

  ul {
    display: flex;
    gap: 16px;
    align-items: center;

    margin: 0;
    padding: 0;

    list-style: none;
  }

  ul:last-child {
    gap: 12px;

    button {
      height: 24px;
      font-size: 20px;
    }
  }

  a {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    text-decoration: none;
  }

  .icon {
    font-size: 16px;
  }
</style>
