import { useStore } from "../../store"

export const redo = () => {
  const redoStack = useStore.getState().redoStack
  if (redoStack.length === 0) {
    console.error("Cannot perform undo operation on empty stack")
    return
  }

  const lastCommand = redoStack.pop()

  if (lastCommand) {
    const currentVideostrate = useStore.getState().parsedVideostrate.clone()
    useStore.getState().addToUndoStack(
      {
        ...lastCommand,
        script: {
          ...lastCommand.script,
          parsedVideostrate: currentVideostrate,
        },
      },
      true
    )

    useStore
      .getState()
      .setParsedVideostrate(lastCommand.script.parsedVideostrate)
    useStore.getState().setRedoStack(redoStack)
  }
}
