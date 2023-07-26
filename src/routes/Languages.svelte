<script lang="ts">
  import {locales} from "../i18n/i18n-util"
  import type {Locales} from "../i18n/i18n-types"
  import {loadLocaleAsync} from "../i18n/i18n-util.async"
  import {setLocale} from "../i18n/i18n-svelte"

  async function applyLocale(locale: Locales) {
    localStorage.setItem("locale", locale)
    await loadLocaleAsync(locale)
    setLocale(locale)
  }
</script>

<ul>
  {#each locales as locale}
    <li><button on:click={() => applyLocale(locale)}>{locale}</button></li>
  {/each}
</ul>
