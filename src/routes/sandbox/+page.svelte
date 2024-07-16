<script lang="ts">
  import type { ChannelEventData } from "../(app)/plugin/plugin-types";

  let ongoingRequest: Promise<unknown> | undefined = undefined;
  let resolveRequest: ((data: unknown) => void) | undefined = undefined;
  let source: MessageEventSource | undefined = undefined;

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  async function post(channel: string, args: unknown[]) {
    while (ongoingRequest) {
      await ongoingRequest;
    }
    ongoingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
      source?.postMessage([channel, args], { targetOrigin: "*" });
    });
    ongoingRequest.then(() => {
      ongoingRequest = undefined;
    });
    return ongoingRequest;
  }

  function onMessage(event: MessageEvent<ChannelEventData>) {
    if ("response" in event.data) {
      resolveRequest?.(event.data.response);
    } else {
      source = event.source ?? undefined;

      const Action = event.data.actionCodes;
      Object.assign(
        Action,
        Object.fromEntries(
          Object.values(event.data.actionCodes)
            .filter((it) => !!it.id)
            .map((it) => [it.id, it]),
        ),
      );

      const Chara = Object.fromEntries(
        event.data.charaChannels.map((name) => [
          name,
          (...args: unknown[]) => post(name, args),
        ]),
      );

      AsyncFunction(
        "Action",
        "Chara",
        '"use strict"\n' + event.data.script,
      )(Action, Chara);
    }
  }
</script>

<svelte:window on:message={onMessage} />
