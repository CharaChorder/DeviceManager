<script lang="ts">
  import { serialPort } from "$lib/serial/connection";

  let files: FileList | null = $state(null);

  $effect(() => {
    const file = files?.[0];
    if (file && $serialPort) {

      $serialPort.updateFirmware(file);
    }
  });
</script>

<input type="file" accept=".bin" bind:files />
