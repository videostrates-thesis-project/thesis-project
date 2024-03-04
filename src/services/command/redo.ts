import { useStore } from "../../store"
import { resolveWorkingContext } from "./resolveWorkingContext"

export const redo = () => {
  const redoStack = useStore.getState().redoStack
  if (redoStack.length === 0) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const lastCommand = redoStack.pop()

  if (lastCommand) {
    const workingContext = resolveWorkingContext(lastCommand.contextType)
    const currentVideostrate = workingContext.getVideostrate()
    useStore
      .getState()
      .addToUndoStack({ ...lastCommand, parsedVideostrate: currentVideostrate })

    workingContext.setVideostrate(lastCommand.parsedVideostrate)
    useStore.getState().setRedoStack(redoStack)
  }
}
