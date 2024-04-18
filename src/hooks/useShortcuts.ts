import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import useEditCommands from "./useEditCommands"
import useThrottledFunction from "./useThrottledFunction"
import { deleteElement } from "../services/interpreter/builtin/deleteElement"
import { undo } from "../services/interpreter/undo"
import { redo } from "../services/interpreter/redo"

const useShortcuts = (enabled: boolean) => {
  const { selectedClip } = useStore()
  const { moveLayerDown, moveLayerUp, execute } = useEditCommands()
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
          if (selectedClip) execute(deleteElement(selectedClip.id))
          break
        case "ArrowDown":
          if (selectedClip) throttledMoveLayerDown(selectedClip.id)
          break
        case "ArrowUp":
          if (selectedClip) throttledMoveLayerUp(selectedClip.id)
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
      execute,
      selectedClip,
      throttledMoveLayerDown,
      throttledMoveLayerUp,
      throttledRedo,
      throttledUndo,
    ]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [enabled, handleKeyPress])
}

export default useShortcuts
