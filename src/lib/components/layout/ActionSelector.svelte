<script lang="ts">
  import ActionList from "./ActionList.svelte";

  let {
    currentAction = undefined,
    nextAction = undefined,
    onselect,
    onclose,
  }: {
    currentAction?: number;
    nextAction?: number;
    onselect: (id: number) => void;
    onclose: () => void;
  } = $props();
</script>

<dialog
  open
  onclick={(event) => {
    if (event.target === event.currentTarget) onclose();
  }}
>
  <ActionList
    autofocus={true}
    {currentAction}
    {nextAction}
    {onselect}
    {onclose}
  />
</dialog>

<style lang="scss">
  dialog {
    display: flex;
    justify-content: center;
    align-items: center;

    border: none;

    background: rgba(0 0 0 / 60%);

    width: 100%;
    height: 100%;
  }
</style>
