import { useStore } from "../../store"
import { resolveWorkingContext } from "./resolveWorkingContext"

export const undo = () => {
  const undoStack = useStore.getState().undoStack
  if (undoStack.length === 0) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const lastCommand = undoStack.pop()

  if (lastCommand) {
    const workingContext = resolveWorkingContext(lastCommand.contextType)
    const currentVideostrate = workingContext.getVideostrate()
    useStore
      .getState()
      .addToRedoStack({ ...lastCommand, parsedVideostrate: currentVideostrate })

    workingContext.setVideostrate(lastCommand.parsedVideostrate)
    useStore.getState().setUndoStack(undoStack)
  }
}
