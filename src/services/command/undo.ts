import { useStore } from "../../store"
import { unexecuteScript } from "./unexecuteScript"

export const undo = () => {
  const undoStack = useStore.getState().undoStack
  if (undoStack.length === 0) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const lastCommand = undoStack.pop()

  if (lastCommand) {
    unexecuteScript(lastCommand)
    useStore.getState().setUndoStack(undoStack)
  }
}
