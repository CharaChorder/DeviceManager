<script lang="ts">
  let {
    ports,
    onconfirm,
  }: {
    ports: SerialPort[];
    onconfirm: (port: SerialPort | undefined) => void;
  } = $props();
  let selected = $state(ports[0]?.getInfo().name);
</script>

<dialog>
  {#each ports as port}
    {@const info = port.getInfo()}
    <label
      >{info.product}<input
        type="radio"
        name="port"
        value={info.name}
        bind:group={selected}
      /></label
    >
  {/each}

  <button onclick={() => onconfirm(undefined)}>Cancel</button>
  <button
    onclick={() =>
      onconfirm(ports.find((it) => it.getInfo().name === selected))}>Ok</button
  >
</dialog>
