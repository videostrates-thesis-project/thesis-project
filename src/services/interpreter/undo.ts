import { useStore } from "../../store"

export const undo = () => {
  const lastCommand = useStore.getState().popUndoStack()
  if (lastCommand === undefined) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const currentVideostrate = useStore.getState().parsedVideostrate.clone()
  useStore.getState().addToRedoStack({
    ...lastCommand,
    script: { ...lastCommand.script, parsedVideostrate: currentVideostrate },
  })

  useStore.getState().setParsedVideostrate(lastCommand.script.parsedVideostrate)

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
