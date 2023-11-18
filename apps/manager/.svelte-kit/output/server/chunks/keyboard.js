const data = {
  name: "Keyboard",
  description: "Keyboard specific actions",
  icon: "keyboard",
  actions: {
    512: {
      id: "LEFT_CTRL",
      title: "Control Keyboard Modifier",
      variant: "left",
      icon: "keyboard_control_key"
    },
    513: {
      id: "LEFT_SHIFT",
      title: "Shift Keyboard Modifier",
      variant: "left",
      icon: "shift"
    },
    514: {
      id: "LEFT_ALT",
      title: "Alt Keyboard Modifier",
      variant: "left",
      icon: "keyboard_option_key"
    },
    515: {
      id: "LEFT_GUI",
      title: "GUI Keyboard Modifier",
      variant: "left",
      icon: "keyboard_command_key"
    },
    516: {
      variationOf: 512,
      id: "RIGHT_CTRL",
      title: "Control Keyboard Modifier",
      variant: "right",
      icon: "keyboard_control_key"
    },
    517: {
      variationOf: 513,
      id: "RIGHT_SHIFT",
      title: "Shift Keyboard Modifier",
      variant: "left",
      icon: "shift"
    },
    518: {
      variationOf: 514,
      id: "RIGHT_ALT",
      title: "Alt Keyboard Modifier",
      variant: "left",
      icon: "keyboard_option_key"
    },
    519: {
      variationOf: 515,
      id: "RIGHT_GUI",
      title: "GUI Keyboard Modifier",
      variant: "left",
      icon: "keyboard_command_key"
    },
    520: {
      id: "RELEASE_MOD",
      title: "Release all keyboard modifiers",
      icon: "step_out"
    },
    521: {
      id: "RELEASE_ALL",
      title: "Release all keys and keyboard modifiers",
      icon: "merge_type"
    },
    522: {
      id: "RELEASE_KEYS",
      title: "Release all keys, but not keyboard modifiers",
      icon: "text_rotate_up"
    }
  }
};
export {
  data as default
};
