import { useStore } from "../../store"

export const undo = () => {
  const undoStack = useStore.getState().undoStack
  if (undoStack.length === 0) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const lastCommand = undoStack.pop()

  if (lastCommand) {
    const currentVideostrate = useStore.getState().parsedVideostrate.clone()
    useStore
      .getState()
      .addToRedoStack({ ...lastCommand, parsedVideostrate: currentVideostrate })

    useStore.getState().setParsedVideostrate(lastCommand.parsedVideostrate)
    useStore.getState().setUndoStack(undoStack)
  }
  if (useStore.getState().pendingChanges) {
    useStore.getState().setPendingChanges(false)
  }
  return {
    noRedo: () => {
      const redoStack = useStore.getState().redoStack
      redoStack.pop()
      useStore.getState().setRedoStack(redoStack)
    },
  }
}
