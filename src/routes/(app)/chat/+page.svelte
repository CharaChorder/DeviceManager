<script lang="ts">
  import { browser } from "$app/environment";
  import { onDestroy, onMount, setContext } from "svelte";
  import type {
    IndexedDBStore,
    IndexedDBCryptoStore,
    LoginResponse,
  } from "matrix-js-sdk";
  import MatrixTimeline from "$lib/chat/MatrixTimeline.svelte";
  import { matrixClient, currentRoomId } from "$lib/chat/chat";
  import MatrixRooms from "$lib/chat/MatrixRooms.svelte";
  import MatrixRoomMembers from "$lib/chat/MatrixRoomMembers.svelte";

  let loggedIn = $state(false);
  let ready = $state(false);

  let store: IndexedDBStore;
  let cryptoStore: IndexedDBCryptoStore;

  onMount(async () => {
    if (!browser) return;
    const { createClient, IndexedDBStore, IndexedDBCryptoStore } = await import(
      "matrix-js-sdk"
    );

    const storedLogin = getStoredLogin();

    store = new IndexedDBStore({
      dbName: "matrix",
      indexedDB: window.indexedDB,
    });
    cryptoStore = new IndexedDBCryptoStore(window.indexedDB, "matrix-crypto");

    $matrixClient = createClient({
      baseUrl: import.meta.env.VITE_MATRIX_URL,
      userId: storedLogin?.user_id,
      accessToken: storedLogin?.access_token,
      timelineSupport: true,
      store,
      cryptoStore,
    });

    const loginToken = new URLSearchParams(window.location.search).get(
      "loginToken",
    );
    if (loginToken) {
      await handleLogin(await $matrixClient.loginWithToken(loginToken));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    await postLogin();
  });

  async function passwordLogin(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    await handleLogin(
      await $matrixClient.loginWithPassword(username, password),
    );
    await postLogin();
  }

  async function handleLogin(response: LoginResponse) {
    localStorage.setItem("matrix-login", JSON.stringify(response));
  }

  async function postLogin() {
    loggedIn = $matrixClient.isLoggedIn();

    if (loggedIn) {
      await store.startup();
      await cryptoStore.startup();
      await $matrixClient.startClient();
      $matrixClient.once("sync", function (state, prevState, res) {
        ready = true;
      });
    }
  }

  function getStoredLogin(): LoginResponse | undefined {
    try {
      return JSON.parse(localStorage.getItem("matrix-login")!);
    } catch {
      return undefined;
    }
  }

  onDestroy(() => {
    if ($matrixClient) {
      $matrixClient.stopClient();
    }
  });
</script>

{#if $matrixClient && loggedIn}
  {#if ready}
    <div class="chat">
      <div class="rooms">
        <button
          onclick={() => {
            $matrixClient.logout(true);
            $matrixClient.clearStores();
            localStorage.removeItem("matrix-login");
            window.location.reload();
          }}>logout</button
        >
        <MatrixRooms rooms={$matrixClient.getRooms()} />
      </div>
      {#if $currentRoomId}
        {@const room = $matrixClient.getRoom($currentRoomId)}
        {#key room}
          {#if room}
            <div class="timeline">
              <MatrixTimeline timeline={room.getLiveTimeline()} />
            </div>
            <div class="members">
              <MatrixRoomMembers members={room.getJoinedMembers()} />
            </div>
          {/if}
        {/key}
      {/if}
    </div>
  {/if}
{:else if $matrixClient}
  {#await $matrixClient.loginFlows() then flows}
    {#each flows.flows as flow}
      {#if flow.type === "m.login.sso"}
        <a
          href={$matrixClient.getSsoLoginUrl(`${window.location.origin}/chat/`)}
        >
          {#each flow.identity_providers as idp}
            {#if idp.icon}
              <img src={$matrixClient.mxcUrlToHttp(idp.icon)} alt={idp.name} />
            {:else}
              {idp.name}
            {/if}
          {/each}
        </a>
      {:else if flow.type === "m.login.password"}
        <!-- TODO: unambigous sso
        <form onsubmit={passwordLogin}>
          <input name="username" type="text" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
        -->
      {/if}
    {/each}
  {/await}
{/if}

<style lang="scss">
  .chat {
    display: flex;
    width: 100%;
    height: 100%;

    > *:not(:last-child) {
      border-right: 1px solid var(--md-sys-color-outline);
    }
  }


  .timeline {
    flex-grow: 1;
  }

  .rooms {
    flex-shrink: 0;
  }

  .members {
    width: 200px;
    flex-shrink: 0;
  }
</style>
