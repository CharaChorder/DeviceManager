import {Extension, Node} from "@tiptap/core"

const CharaAction = Node.create({
  name: "Action",
  renderHTML({HTMLAttributes}) {
    return ["kbd", HTMLAttributes, 0]
  },
})
