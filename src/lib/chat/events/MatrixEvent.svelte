<script lang="ts">
  import type {
    EventTimeline,
    MatrixEvent,
    MatrixEventEvent,
    Relations,
    RelationsEvent,
    RoomMember,
  } from "matrix-js-sdk";
  import MatrixMessageEvent from "./MatrixMessageEvent.svelte";
  import { matrixClient, memberColor } from "../chat";
  import { theme } from "$lib/preferences";
  import { hexFromArgb } from "@material/material-color-utilities";
  import { fade } from "svelte/transition";
  import type { Replay } from "$lib/charrecorder/core/types";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import type { ReplayPlayer } from "$lib/charrecorder/core/player";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";

  let {
    event,
    prev,
    sender,
    replay: replayPlayer,
    timeline,
  }: {
    event?: MatrixEvent;
    prev?: MatrixEvent;
    sender?: RoomMember | null;
    replay?: Replay | ReplayPlayer;
    timeline?: EventTimeline;
  } = $props();

  let toolbarHover = $state(false);
  let mainHover = $state(false);

  let hover = $derived(toolbarHover || mainHover);

  let replay: Replay | undefined = $state();

  let reactions: Relations | undefined = $state(
    timeline && event?.event.event_id
      ? timeline
          .getTimelineSet()
          .relations.getChildEventsForEvent(
            event.event.event_id,
            "m.annotation",
            "m.reaction",
          )
      : undefined,
  );
  let annotations = writable<[string, Set<MatrixEvent>][] | null | undefined>();

  function createRelations() {
    if (!timeline || !event?.event.event_id) return;
    reactions?.off("Relations.add" as RelationsEvent.Add, createRelations);
    reactions?.off(
      "Relations.remove" as RelationsEvent.Remove,
      createRelations,
    );
    reactions = timeline
      .getTimelineSet()
      .relations.getChildEventsForEvent(
        event.event.event_id,
        "m.annotation",
        "m.reaction",
      );
    reactions?.on("Relations.add" as RelationsEvent.Add, createRelations);
    reactions?.on("Relations.remove" as RelationsEvent.Remove, createRelations);
    reactions?.on(
      "Relations.redaction" as RelationsEvent.Redaction,
      createRelations,
    );
    annotations.set(
      reactions?.getSortedAnnotationsByKey()?.filter(([, it]) => it.size > 0),
    );
    console.log("create");
  }

  onMount(() => {
    createRelations();
    event?.on(
      "Event.relationsCreated" as MatrixEventEvent.RelationsCreated,
      createRelations,
    );
  });

  onDestroy(() => {
    event?.off(
      "Event.relationsCreated" as MatrixEventEvent.RelationsCreated,
      createRelations,
    );
    reactions?.off("Relations.add" as RelationsEvent.Remove, createRelations);
    reactions?.off(
      "Relations.remove" as RelationsEvent.Remove,
      createRelations,
    );
    reactions?.off(
      "Relations.redaction" as RelationsEvent.Redaction,
      createRelations,
    );
  });
</script>

<div
  class="event"
  role="log"
  onmouseover={() => (mainHover = true)}
  onfocus={() => (mainHover = true)}
  onmouseout={() => (mainHover = false)}
  onblur={() => (mainHover = false)}
>
  {#if event && hover}
    <div class="backdrop" transition:fade={{ duration: 100 }}></div>
  {/if}

  {#if sender && !(prev && prev?.getType() === event?.getType() && prev.sender?.userId === event.sender?.userId)}
    {@const color = memberColor(sender, $theme)}
    {@const avatarMxc = sender.getMxcAvatarUrl()}
    {#if avatarMxc}
      {@const avatar = $matrixClient.mxcUrlToHttp(avatarMxc, 32, 32)}
      <img
        class="avatar"
        src={avatar}
        alt={sender.name}
        width="32"
        height="32"
      />
    {:else}
      <div
        class="avatar avatar-placeholder icon"
        style:background={hexFromArgb(
          $theme.mode === "dark" ? color.dark.color : color.light.color,
        )}
        style:color={hexFromArgb(
          $theme.mode === "dark" ? color.dark.onColor : color.light.onColor,
        )}
      >
        person
      </div>
    {/if}

    <div
      class="sender"
      style:color={hexFromArgb(
        $theme.mode === "dark" ? color.dark.color : color.light.color,
      )}
    >
      <strong>{sender.name}</strong>
      {#if replay || replayPlayer}
        <div class="dots">
          {#each new Array(3) as _, i}
            <div
              style:animation-delay={i * 0.2 + "s"}
              style:background={hexFromArgb(
                $theme.mode === "dark" ? color.dark.color : color.light.color,
              )}
              class="dot"
            ></div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="content">
    {#if event}
      {#if event.getType() === "m.room.message"}
        <MatrixMessageEvent {event} bind:replay />
      {:else}
        <details>
          <summary>{event.getType()}</summary>
          <pre>{JSON.stringify(event.event, null, 2)}</pre>
        </details>
      {/if}
    {/if}
    {#if replayPlayer}
      <CharRecorder replay={replayPlayer} cursor={true} keys={true} />
    {/if}
  </div>

  {#if event && hover}
    <div
      role="toolbar"
      tabindex="0"
      class="toolbar"
      transition:fade={{ duration: 100 }}
      onmouseover={() => (toolbarHover = true)}
      onfocus={() => (toolbarHover = true)}
      onmouseout={() => (toolbarHover = false)}
      onblur={() => (toolbarHover = false)}
    >
      {#if event.getType() === "m.room.message"}
        {@const message = event.event.content?.["body"]}
        <a
          class="icon rocket"
          href="/learn/sentence/?sentence={encodeURIComponent(message)}"
          >rocket_launch</a
        >
      {/if}
      <button class="icon">add_reaction</button>
      <button class="icon">reply</button>
      {#if event.event.content?.["m.replay"]}
        {#if replay}
          <button class="icon" onclick={() => (replay = undefined)}>stop</button
          >
        {:else}
          <button
            class="icon"
            onclick={() => (replay = event.event.content?.["m.replay"])}
            >replay</button
          >
        {/if}
      {/if}
      <button class="icon">more_horiz</button>
    </div>
  {/if}

  {#if $annotations && $annotations.length > 0}
    <div class="reactions">
      {#each $annotations as [reaction, events]}
        <button class="reaction"
          >{reaction} <span class="count">{events.size}</span></button
        >
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  details {
    opacity: 0.5;
    word-wrap: break-word;
  }

  pre {
    text-wrap: wrap;
    word-wrap: break-word;
  }

  @keyframes rocket {
    0% {
      transform: translate(0, 0);
    }
    90% {
      transform: translate(4px, -4px);
    }
    100% {
      transform: translate(0, 0);
    }
  }
  .icon.rocket {
    animation: rocket 2s;
  }

  .toolbar {
    position: absolute;
    top: -26px;
    right: 0;
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    padding: 4px;
    border-radius: 4px;
    display: flex;
    z-index: 100;

    a,
    button {
      font-size: 16px;
      width: 24px;
      height: 24px;
    }
  }

  .dots {
    display: flex;
    gap: 2px;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: bounce 1s infinite;
  }

  .sender,
  .avatar {
    margin-block: 2px 4px;
  }

  .avatar {
    grid-area: avatar;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    translate: 0 2px;
  }

  div.avatar {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sender {
    display: flex;
    grid-area: sender;
    align-items: center;
    gap: 8px;
  }

  .reactions {
    grid-area: reactions;
    margin-top: 2px;
    display: flex;
    gap: 4px;
  }

  .reaction {
    border: 1px solid var(--md-sys-color-outline);
    padding: 6px;
    border-radius: 6px;
    height: 24px;
    display: flex;
    font-size: 12px;

    > .count {
      font-size: 10px;
    }
  }

  .event {
    display: grid;
    position: relative;
    padding-inline: 0.5em;
    margin-inline: 0.5em;
    padding-block: 0.25em;
    border-radius: 4px;

    grid-template-areas:
      "avatar sender date"
      "avatar content content"
      "none reactions reactions";
    grid-template-columns: 32px 1fr auto;
  }

  .content {
    grid-area: content;
    text-wrap: wrap;
    word-wrap: break-word;
  }

  .reactions,
  .content,
  .sender {
    margin-inline: 8px;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.25;

    background: var(--md-sys-color-surface-variant);

    border-radius: 8px;
  }
</style>
