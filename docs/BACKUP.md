# Chara Backup Format, Version 1

JSON Schema files: TBD

Chara backups are serialized using JSON, in this general format:

```json
{
  "charaVersion": 1,
  "type": "..."
}
```

The presence of the key `charaVersion` uniquely identifies the JSON file as a chara backup file and serves
as a discriminator against other generic JSON files. This key is mandatory for that reason.

## Type `layout`

```json
{
  "charaVersion": 1,
  "type": "layout",
  "device": "one",
  "layers": [[], [], []]
}
```

Devices at the current point in time may be identified as either `lite` or `one`, more to come in the future.

Layers are serialized as an array of `[layer1, layer2, layer3]` in the internal order of the key, each specifying
an action code. Action codes of `0` are considered unassigned.

## Type `chords`

```json
{
  "charaVersion": 1,
  "type": "chords",
  "chords": [
    [
      [1, 2, 3],
      [3, 4, 5]
    ],
    [
      [6, 7, 8],
      [9, 10, 11]
    ]
  ]
}
```

Chords are serialized using a key-value mapping of chord action codes to actions.

## Type `settings`

```json
{
  "charaVersion": 1,
  "type": "settings",
  "settings": [0, 1, 3, 6]
}
```

Settings are serialized as an array of the values in the way they appear on the device.
