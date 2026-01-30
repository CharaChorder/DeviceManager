<script lang="ts">
  import type { KeyInfo } from "$lib/serial/keymap-codes";

  let { valid, info }: { valid: boolean; info: KeyInfo } = $props();
</script>

{#if valid}
  {#if info.icon || info.display || !info.id}
    &lt;<b>{info.id ?? `0x${info.code.toString(16)}`}</b>&gt;
  {/if}
  {#if info.title}
    {info.title}
  {/if}
  {#if info.variant === "left"}
    (Left)
  {:else if info.variant === "right"}
    (Right)
  {/if}
  {#if info.description}
    <br />
    <small>{info.description}</small>
  {/if}
  {#if info.breaking}
    <br />&nbsp;<i>Prevents prepended autospaces</i>
  {/if}
  {#if info.separator || info.breaking}
    <br />&nbsp;<i>Stops autocorrect</i>
  {/if}
{:else}
  <b>Unknown Action</b><br />
  {#if info.code > 1023}
    This action cannot be translated and will be ingored.
  {/if}
{/if}
