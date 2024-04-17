import { useCallback } from "react"
import { useStore } from "../store"

const useLogger = () => {
  const { archivedMessages, currentMessages, undoStack } = useStore()
  const exportLogs = useCallback(() => {
    const messageHistory = archivedMessages
      .concat(currentMessages)
      .map((m) => JSON.stringify(m))
      .join("\n")
    console.log(undoStack)
    downloadStringAsFile(messageHistory, "chat_logs.json", "application/json")
  }, [archivedMessages, currentMessages, undoStack])

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
