<script lang="ts">
  import LL from "../i18n/i18n-svelte"
  import {changes, ChangeType, chords, layout, overlay, settings} from "$lib/undo-redo"
  import type {Change} from "$lib/undo-redo"
  import {fly} from "svelte/transition"
  import {action} from "$lib/title"
  import {deviceChords, deviceLayout, deviceSettings, serialPort, syncStatus} from "$lib/serial/connection"
  import {deserializeActions} from "$lib/serial/chord"

  function undo() {
    redoQueue = [$changes.pop()!, ...redoQueue]
    changes.update(it => it)
  }

  function redo() {
    const [change, ...queue] = redoQueue
    changes.update(it => {
      it.push(change)
      return it
    })
    redoQueue = queue
  }
  let redoQueue: Change[] = []

  async function apply() {
    const port = $serialPort
    if (!port) return

    $syncStatus = "uploading"

    for (const [id, phrase] of $overlay.chords) {
      const actions = deserializeActions(id)
      if (actions.length > 0) {
        await port.setChord({actions, phrase})
      } else {
        await port.deleteChord({actions})
      }
    }

    for (const [layer, actions] of $overlay.layout.entries()) {
      for (const [id, action] of actions) {
        await port.setLayoutKey(layer + 1, id, action)
      }
    }

    for (const [id, setting] of $overlay.settings) {
      await port.setSetting(id, setting)
    }

    $deviceLayout = $layout.map(layer => layer.map<number>(({action}) => action)) as [
      number[],
      number[],
      number[],
    ]
    $deviceChords = $chords.map(({actions, phrase}) => ({actions, phrase}))
    $deviceSettings = $settings.map(({value}) => value)
    $changes = []
    $syncStatus = "done"
  }

  async function flashChanges() {
    $syncStatus = "uploading"
    // Yes, this is a completely arbitrary and unnecessary delay.
    // The only purpose of it is to create a sense of weight,
    // aka make it more "energy intensive" to click.
    // The only conceivable way users could reach the commit limit in this case
    // would be if they click it every time they change a setting.
    // Because of that, we don't need to show a fearmongering message such as
    // "Your device will break after you click this 10,000 times!"
    await new Promise(resolve => setTimeout(resolve, 6000))
    if ($serialPort) {
      await $serialPort.commit()
      $changes = []
    }
    $syncStatus = "done"
  }
</script>

<!-- <svg viewBox="0 0 36 36" style="width: 48px">
  <defs>
    <rect
      id="mouth"
      x="13"
      y="13"
      width="512"
      height="10"
      rx="5"
      style="transform-origin: center; animation-direction: alternate-reverse"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="scale"
        values="1; 0.25; 1"
        keyTimes="0; 0.33; 1"
        dur="0.4"
        repeatCount="indefinite"
      />
    </rect>
    <mask id="inner-mask">
      <rect x="0" y="0" width="36" height="36" />
      <use fill="white" href="#mouth" />
    </mask>
    <mask id="clip">
      <rect x="0" y="0" width="36" height="36" fill="white" />
      <use fill="black" href="#mouth" />
    </mask>
  </defs>

  <g mask="url(#clip)" style="transform-origin: center">
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="scale"
      values="1 1;0.9 0.8; 1 1"
      keyTimes="0; 0.33; 1"
      dur="0.4"
      repeatCount="indefinite"
    />
    <circle cx="18" cy="18" r="14" stroke="currentcolor" fill="none" stroke-width="5" />
    <circle cx="18" cy="18" r="10" fill="currentcolor" stroke-width="6" />
  </g>
  <g mask="url(#inner-mask)">
    <text
      mask="url(#inner-mask)"
      x="18"
      y="17.2"
      fill="currentcolor"
      text-anchor="start"
      dominant-baseline="central"
      font-size="8"
      font-weight="bold"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="translate"
        from="0"
        to="-76.8"
        dur="1.6"
        repeatCount="indefinite"
      />
      c&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;o&nbsp;&nbsp;&nbsp;s&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;c&nbsp;&nbsp;&nbsp;o&nbsp;&nbsp;&nbsp;s
    </text>
  </g>
</svg> -->

<button
  use:action={{title: $LL.saveActions.UNDO(), shortcut: "ctrl+z"}}
  class="icon"
  disabled={$changes.length === 0}
  on:click={undo}>undo</button
>
<button
  use:action={{title: $LL.saveActions.REDO(), shortcut: "ctrl+y"}}
  class="icon"
  disabled={redoQueue.length === 0}
  on:click={redo}>redo</button
>
<div class="separator" />
<button
  use:action={{title: $LL.saveActions.SAVE(), shortcut: "ctrl+shift+s"}}
  on:click={flashChanges}
  class="icon">save</button
>
{#if $changes.length !== 0}
  <button
    class="click-me"
    transition:fly={{x: 8}}
    on:click={apply}
    use:action={{
      title: $LL.changes.TITLE(),
      shortcut: "ctrl+s",
    }}><span class="icon">bolt</span>{$LL.saveActions.APPLY()}</button
  >
{/if}

<style lang="scss">
  .click-me {
    display: flex;
    align-items: center;
    justify-content: center;

    height: fit-content;
    margin-inline: 8px;
    padding-block: 2px;
    padding-inline-start: 4px;
    padding-inline-end: 8px;

    font-family: inherit;
    font-weight: bold;
    color: var(--md-sys-color-primary);

    border: 2px solid var(--md-sys-color-primary);
    border-radius: 18px;
    outline: 2px dashed var(--md-sys-color-primary);
    outline-offset: 2px;
  }

  .separator {
    width: 1px;
    height: 24px;
    background: var(--md-sys-color-outline-variant);
  }
</style>
