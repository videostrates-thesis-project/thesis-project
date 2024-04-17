import { useCallback } from "react"
import { useStore } from "../store"

const useLogger = () => {
  const { archivedMessages, currentMessages, archivedUndoStack } = useStore()
  const exportLogs = useCallback(() => {
    const messageHistory = [...archivedMessages, ...currentMessages]
      .map((m) => JSON.stringify(m))
      .join("\n")
    downloadStringAsFile(messageHistory, "chat_logs.json", "application/json")

    const currentState = JSON.stringify({
      currentUndoId: useStore.getState().undoStack.at(-1)?.id ?? "",
      parsedVideostrate: useStore.getState().parsedVideostrate,
    })
    const undoHistory =
      archivedUndoStack.map((u) => JSON.stringify(u)).join("\n") +
      "\n" +
      currentState

    downloadStringAsFile(undoHistory, "undo_logs.json", "application/json")
  }, [archivedMessages, archivedUndoStack, currentMessages])

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
