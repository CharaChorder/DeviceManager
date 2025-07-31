<script lang="ts">
  import type { RoomMember } from "matrix-js-sdk";
  import { matrixClient, memberColor } from "./chat";
  import { theme } from "$lib/preferences";
  import { hexFromArgb } from "@material/material-color-utilities";

  let { members }: { members: RoomMember[] } = $props();
</script>

<div class="member-list">
  {#each members as member (member.userId)}
    {@const avatar = member.getMxcAvatarUrl()}
    <div class="member">
      {#if avatar}
        <img
          class="avatar"
          src={$matrixClient.mxcUrlToHttp(avatar, 32, 32)}
          alt={member.name}
          width="32"
          height="32"
        />
      {:else}
        {@const color = memberColor(member, $theme)}
        {@const modeColor = $theme.mode === "dark" ? color.dark : color.light}
        <div
          style:background={hexFromArgb(modeColor.color)}
          style:color={hexFromArgb(modeColor.onColor)}
          class="avatar avatar-placeholder icon"
        >
          person
        </div>
      {/if}
      <span>{member.name}</span>
    </div>
  {/each}
</div>

<style lang="scss">
  .avatar {
    flex-shrink: 0;
    border-radius: 50%;
    width: 32px;
    height: 32px;
  }

  .avatar-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
  }

  .member {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .member-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 8px;
    height: 100%;
    overflow-y: auto;
  }

  span {
    word-break: break-all;
  }
</style>
