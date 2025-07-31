<script lang="ts">
  import type { Room } from "matrix-js-sdk";
  import { matrixClient, currentRoomId } from "./chat";

  let { rooms }: { rooms: Room[] } = $props();
</script>

<div class="rooms">
  {#each $matrixClient.getRooms() as room}
    {@const avatar = room.getMxcAvatarUrl()}
    <button
      class:active={$currentRoomId === room.roomId}
      class="room"
      onclick={() => ($currentRoomId = room.roomId)}
    >
      {#if avatar}
        <img
          alt={room.name}
          src={$matrixClient.mxcUrlToHttp(avatar, 16, 16)}
          width="16"
          height="16"
        />
      {:else}
        <div>#</div>
      {/if}
      <div>{room.name}</div>
    </button>
  {/each}

  {#await $matrixClient.publicRooms()}
    <div>Loading...</div>
  {:then rooms}
    {#each rooms.chunk as room}
      <button class="room" onclick={() => ($currentRoomId = room.roomId)}>
        <div>#</div>
        <div>{room.name}</div>
      </button>
    {/each}
  {:catch error}
    <div>{error.message}</div>
  {/await}
</div>

<style lang="scss">
  .rooms {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    padding-left: 0;
    width: 100%;
  }

  .room {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border-radius: 8px;
    padding-inline: 16px;
    padding-block: 2px;
    padding-block: 4px;
    width: 100%;
    height: unset;
    min-height: 0;

    &.active {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
  }
</style>
