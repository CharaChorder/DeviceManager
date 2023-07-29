<script lang="ts">
  import LL, {setLocale} from "../i18n/i18n-svelte"
  import {theme} from "$lib/preferences"
  import {tick} from "svelte"
  import {detectLocale, locales} from "../i18n/i18n-util"
  import {loadLocaleAsync} from "../i18n/i18n-util.async"
  import type {Locales} from "../i18n/i18n-types"

  let locale = (localStorage.getItem("locale") as Locales) || detectLocale()
  $: (async () => {
    localStorage.setItem("locale", locale)
    await loadLocaleAsync(locale)
    setLocale(locale)
  })()
</script>

<section>
  <h2>{$LL.profile.TITLE()}</h2>
  <fieldset>
    <legend>
      <span class="icon">format_paint</span>
      {$LL.profile.theme.TITLE()}
    </legend>

    <input title={$LL.profile.theme.COLOR_SCHEME()} type="color" bind:value={$theme.color} />
    <button
      title={$theme.mode === "light" ? $LL.profile.theme.LIGHT_MODE() : $LL.profile.theme.DARK_MODE()}
      class="icon"
      on:click={() => {
        document.startViewTransition(async () => {
          $theme.mode = $theme.mode === "light" ? "dark" : "light"
          await tick()
        })
      }}
    >
      {#if $theme.mode === "light"}
        light_mode
      {:else if $theme.mode === "dark"}
        dark_mode
      {:else}
        TODO
      {/if}
    </button>
  </fieldset>
  <fieldset>
    <legend>
      <span class="icon">translate</span>
      {$LL.profile.LANGUAGE()}
    </legend>
    {#each locales as code}
      <label>{code}<input bind:group={locale} type="radio" value={code} name="language" /></label>
    {/each}
  </fieldset>
</section>

<style lang="scss">
  h2 {
    grid-column: 1 / span 2;
  }

  section {
    display: grid;
    grid-template-columns: auto auto;
    min-width: 300px;
  }

  fieldset {
    display: flex;
    justify-content: space-around;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 16px;
  }

  legend {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }

  button,
  input[type="color"] {
    cursor: pointer;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    inline-size: 24px;
    block-size: 24px;
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
</style>
