import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import useEditCommands from "./useEditCommands"
import { undo } from "../services/command/undo"
import { redo } from "../services/command/redo"
import useThrottledFunction from "./useThrottledFunction"

const useShortcuts = () => {
  const { selectedClipId } = useStore()
  const { execute, deleteClip, moveLayerDown, moveLayerUp } = useEditCommands()
  const throttledMoveLayerDown = useThrottledFunction(
    (selectedClipId: string) => execute(moveLayerDown(selectedClipId))
  )
  const throttledMoveLayerUp = useThrottledFunction((selectedClipId: string) =>
    execute(moveLayerUp(selectedClipId))
  )
  const throttledUndo = useThrottledFunction(undo)
  const throttledRedo = useThrottledFunction(redo)

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "Delete":
          if (selectedClipId) execute(deleteClip(selectedClipId))
          break
        case "ArrowDown":
          if (selectedClipId) throttledMoveLayerDown(selectedClipId)
          break
        case "ArrowUp":
          if (selectedClipId) throttledMoveLayerUp(selectedClipId)
          break
        case "z":
        case "Z":
          if (event.ctrlKey && !event.shiftKey) {
            throttledUndo()
            // Prevents the browser from going back in the chat textarea
            // (it would happen even if the input is not focused)
            event.preventDefault()
          }
          if (event.ctrlKey && event.shiftKey) {
            throttledRedo()
            event.preventDefault()
          }
          break
        case "y":
        case "Y":
          if (event.ctrlKey) {
            throttledRedo()
            event.preventDefault()
          }
          break
        default:
          break
      }
    },
    [
      deleteClip,
      execute,
      selectedClipId,
      throttledMoveLayerDown,
      throttledMoveLayerUp,
      throttledRedo,
      throttledUndo,
    ]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])
}

export default useShortcuts
