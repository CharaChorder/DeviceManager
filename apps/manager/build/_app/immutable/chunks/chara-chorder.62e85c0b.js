const t={name:"CharaChorder",description:"CharaChorder specific actions",actions:{528:{id:"RESTART",title:"Restart Device",icon:"restart_alt"},530:{id:"BOOT",title:"Reboot to Bootloader",icon:"rule_settings"},532:{id:"GTM",title:"Toggle Generative Text Menu",icon:"terminal",description:`Text based menu which is accessible anywhere you can type.
It allows you to access various device settings and features
without the need for software and is activated by chording both alt keys together.
`},534:{id:"IMPULSE",title:"Toggle Impulse",icon:"heap_snapshot_multiple",description:`An 'on-the-fly' custom chord which can be spontaneously created anywhere that you can type via the GTM
`},536:{id:"DUP",title:"Repeat Last Note",icon:"control_point_duplicate",description:`In character entry, it repeats your last input.
In chorded entry, it is used for words with repeating letters.
`},538:{id:"SPUR",title:"Spurring Toggle",icon:"piano",description:`'Chording only' mode which tells your device to output chords on a press rather than a press & release.
It also enables you to jump from one chord to another without releasing everything and can be activated
in GTM or by chording both mirror keys. It can provide significant speed gains with chording,
but also takes away the flexibility of character entry.
Spurring also helps new users learn how to chord by eliminating the need to focus on timing.
Spurring is toggled by chording both of the 'mirror' keys together.
`},540:{id:"AMBILEFT",title:"Ambidextrous Throwover",icon:"switch_left",variant:"left",description:`Entry mode designed for one-handed typing.
Characters from the opposite hand are mirrored to the hand which activates this feature.
`},542:{variantOf:540,id:"AMBIRIGHT",title:"Ambidextrous Throwover",icon:"switch_right",variant:"right",description:`Entry mode designed for one-handed typing.
Characters from the opposite hand are mirrored to the hand which activates this feature.
`},544:{variantOf:36,id:"SPACERIGHT",title:"Right Spacebar (eg CC Lite)",icon:"space_bar",variant:"right"},548:{id:"KM_1_L",title:"Primary Keymap",icon:"counter_1",variant:"left"},549:{variantOf:548,id:"KM_1_R",title:"Primary Keymap",icon:"counter_1",variant:"right"},550:{id:"KM_2_L",title:"Numeric Layer",icon:"counter_2",variant:"left"},551:{variantOf:550,id:"KM_2_R",title:"Numeric Layer",icon:"counter_2",variant:"right"},552:{id:"KM_3_L",title:"Function Layer",icon:"counter_3",variant:"left"},553:{variationOf:552,id:"KM_3_R",title:"Function Layer",icon:"counter_3",variant:"right"}}};export{t as default};
