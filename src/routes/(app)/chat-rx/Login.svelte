<script lang="ts">
  import { matrixClient } from "$lib/chat/chat";

  function passwordLogin() {
    // TODO
  }
</script>

{#if $matrixClient}
  {#await $matrixClient.loginFlows() then flows}
    {#each flows.flows as flow}
      {#if flow.type === "m.login.sso"}
        <a
          href={$matrixClient.getSsoLoginUrl(`${window.location.origin}/chat/`)}
        >
          {#if 'identity_providers' in flow && flow.identity_providers}
            {#each flow.identity_providers as idp}
              {#if idp.icon}
                <img src={$matrixClient.mxcUrlToHttp(idp.icon)} alt={idp.name} />
              {:else}
                {idp.name}
              {/if}
            {/each}
          {:else}
            Login with SSO
          {/if}
        </a>
      {:else if flow.type === "m.login.password"}
        <form onsubmit={passwordLogin}>
          <input name="username" type="text" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      {/if}
    {/each}
  {/await}
{/if}
