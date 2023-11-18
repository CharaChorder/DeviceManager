<script lang="ts">
  import {createEventDispatcher} from "svelte"

  export let ports: SerialPort[]
  const dispatch = createEventDispatcher<{confirm: SerialPort | undefined}>()
  let selected = ports[0].getInfo().name
</script>

<dialog>
  {#each ports as port}
    {@const info = port.getInfo()}
    <label>{info.product}<input type="radio" name="port" value={info.name} bind:group={selected} /></label>
  {/each}

  <button on:click={() => dispatch("confirm", undefined)}>Cancel</button>
  <button
    on:click={() =>
      dispatch(
        "confirm",
        ports.find(it => it.getInfo().name === selected),
      )}>Ok</button
  >
</dialog>
