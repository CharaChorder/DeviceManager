<script lang="ts">
  import type {
    EventTimeline,
    MatrixEvent,
    MsgType,
    Room,
    RoomEvent,
    RoomMember,
    RoomMemberEvent,
  } from "matrix-js-sdk";
  import { onDestroy, onMount, tick } from "svelte";
  import { matrixClient } from "./chat";
  import MatrixEventComponent from "./events/MatrixEvent.svelte";
  import CharRecorder from "$lib/charrecorder/CharRecorder.svelte";
  import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
  import { type Socket, io } from "socket.io-client";
  import { SvelteMap } from "svelte/reactivity";

  let { timeline }: { timeline: EventTimeline } = $props();

  const excludeEvents = ["m.reaction", "m.room.redaction"];

  let events = $state(
    timeline
      .getEvents()
      .filter((it) => !excludeEvents.includes(it.getType()))
      .reverse(),
  );

  let recorder = $state(new ReplayRecorder());
  let showCursor = $state(false);

  let timelineElement: HTMLElement = $state()!;

  async function onTimeline(
    event: MatrixEvent,
    room?: Room,
    toStartOfTimeline?: boolean,
  ) {
    if (room?.roomId !== timeline.getRoomId()) return;
    const sender = event.getSender();
    if (sender) {
      live.delete(sender);
    }
    if (excludeEvents.includes(event.getType())) return;
    if (toStartOfTimeline) {
      events.push(event);
    } else {
      const needScroll = timelineElement.scrollTop < 20;
      events.unshift(event);
      if (needScroll) {
        await tick();
        timelineElement.scroll({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }

  let typing = $state<string[]>([]);

  function onTyping(event: MatrixEvent, member: RoomMember) {
    typing = event.event.content?.["user_ids"] ?? [];
  }

  async function send() {
    const roomId = timeline.getRoomId();
    if (!roomId) return;
    const finalText = recorder.player.stepper.text
      .map((token) => token.text)
      .join("");
    const finalRecording = recorder.finish();
    if (!finalText) return;
    recorder = new ReplayRecorder();
    await $matrixClient.sendMessage(roomId, {
      msgtype: "m.text" as MsgType.Text,
      body: finalText,
      // @ts-expect-error
      "m.replay": finalRecording,
    });
  }

  function onKey(event: KeyboardEvent) {
    if (event.type === "keyup" && event.key === "Enter" && !event.shiftKey) {
      send();
      return;
    } else {
      recorder.next(event);
    }

    if (event.type === "keyup" && recorder.player.stepper.text.length === 0) {
      recorder = new ReplayRecorder();
    } else {
      socket.emit("message", {
        timeStamp: event.timeStamp,
        type: event.type,
        key: event.key,
        code: event.code,
        username: $matrixClient.getUserId(),
      });
    }
  }

  let socket: Socket = $state()!;
  let live = new SvelteMap<string, ReplayRecorder>();

  onMount(() => {
    socket = io("https://srv.charachorder.io");
    socket.emit("join", timeline.getRoomId());

    socket.on("message", async ({ message }) => {
      let userRecorder = live.get(message.username);
      if (!userRecorder) {
        userRecorder = new ReplayRecorder();
        live.set(message.username, userRecorder);
      }

      await tick();

      userRecorder.next(message);

      if (userRecorder.player.stepper.text.length === 0) {
        live.delete(message.username);
      }
    });

    $matrixClient.on("Room.timeline" as RoomEvent.Timeline, onTimeline);
    $matrixClient.on("RoomMember.typing" as RoomMemberEvent.Typing, onTyping);
  });

  onDestroy(() => {
    socket?.disconnect();
    $matrixClient.off("Room.timeline" as RoomEvent.Timeline, onTimeline);
    $matrixClient.off("RoomMember.typing" as RoomMemberEvent.Typing, onTyping);
  });
</script>

<section>
  <div bind:this={timelineElement} class="timeline">
    {#each live.entries() as [userId, recorder] (userId)}
      {@const roomId = timeline.getRoomId()}
      {#if roomId}
        {@const room = $matrixClient.getRoom(roomId)}
        {@const member = room?.getMember(userId)}
        {#if member}
          <MatrixEventComponent sender={member} replay={recorder.player} />
        {/if}
      {/if}
    {/each}
    {#each events as event, i (event.event["event_id"])}
      {@const prev = events[i + 1]}
      <MatrixEventComponent {event} sender={event.sender} {prev} {timeline} />
    {/each}
  </div>

  <div class="static-elements">
    <div class="indicators"></div>
    <div class="input-box">
      <button class="icon">add</button>
      <div
        role="textbox"
        tabindex="0"
        class="input"
        onkeydown={onKey}
        onkeyup={onKey}
        onfocusin={() => (showCursor = true)}
        onfocusout={() => (showCursor = false)}
      >
        <CharRecorder replay={recorder.player} cursor={showCursor} />
      </div>
      <button class="icon" onclick={send}>send</button>
    </div>
  </div>
</section>

<style lang="scss">
  $border-radius: 16px;


  .input {
    border: 1px solid var(--md-sys-color-outline);
    flex-grow: 1;
    cursor: text;
    padding: 0.5em;
    font-size: 1rem;
    border-radius: $border-radius;

    text-wrap: wrap;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;

    &:focus-visible {
      outline: none;
    }
  }

  .input-box {
    display: flex;
    gap: 4px;
    padding-block: 8px;
    flex-shrink: 0;
    width: 100%;
  }

  .static-elements {
    position: relative;
    width: 100%;
  }

  .timeline {
    contain: content;
    height: auto;
    display: flex;
    flex-direction: column-reverse;
    overflow-y: scroll;
    overflow-x: hidden;
    flex-grow: 1;
    width: 100%;
  }


  section {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    justify-content: flex-end;

    width: 100%;
    height: 100%;
  }
</style>
