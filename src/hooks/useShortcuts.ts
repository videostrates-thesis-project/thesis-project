import { useCallback, useEffect } from "react"
import { useStore } from "../store"
import useEditCommands from "./useEditCommands"

const useShortcuts = () => {
  const { selectedClipId } = useStore()
  const { execute, deleteClip } = useEditCommands()

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "Delete":
          if (selectedClipId) execute(deleteClip(selectedClipId))
          break
        default:
          break
      }
    },
    [deleteClip, execute, selectedClipId]
  )

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress)

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])
}

export default useShortcuts
