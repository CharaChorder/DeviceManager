<script>
  // @ts-nocheck
  let ongoingRequest;
  let resolveRequest;
  let source;
  async function post(channel, args) {
    while (ongoingRequest) {
      await ongoingRequest;
    }
    ongoingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
      source.postMessage([channel, args], "*");
    });
    ongoingRequest.then(() => {
      ongoingRequest = undefined;
    });
    return ongoingRequest;
  }

  window.addEventListener("message", (event) => {
    if ("response" in event.data) {
      resolveRequest(event.data.response);
    } else {
      source = event.source;

      var Action = event.data.actionCodes;
      Object.assign(
        Action,
        Object.fromEntries(
          Object.values(event.data.actionCodes)
            .filter((it) => !!it.id)
            .map((it) => [it.id, it]),
        ),
      );

      var Chara = {};
      for (const fn of event.data.charaChannels) {
        Chara[fn] = (...args) => post(fn, args);
      }

      eval(`(async function(){${event.data.script}})()`);
    }
  });
</script>
