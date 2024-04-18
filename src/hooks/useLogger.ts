import { useCallback } from "react"
import { useStore } from "../store"

const useLogger = () => {
  const exportLogs = useCallback(() => {
    const messageHistory = localStorage.getItem("chatMessages") ?? ""
    downloadStringAsFile(messageHistory, "chat_logs.json", "application/json")

    const archivedUndoStack = localStorage.getItem("archivedUndoStack") ?? ""

    const currentState = JSON.stringify({
      currentUndoId: useStore.getState().undoStack.at(-1)?.id ?? "",
      parsedVideostrate: useStore.getState().parsedVideostrate,
    })
    const undoHistory = archivedUndoStack + "\n" + currentState

    downloadStringAsFile(undoHistory, "undo_logs.json", "application/json")
  }, [])

  const downloadStringAsFile = (
    content: string,
    filename: string,
    contentType: string
  ) => {
    const blob = new Blob([content], { type: contentType })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    exportLogs,
  }
}

export default useLogger
