import { useCallback } from "react"
import Chat from "../Chat"
import { useStore } from "../../store"
import { buildAssistantMessage } from "../../services/chatgpt/assistantTemplate"
import openAIService from "../../services/chatgpt/openai"
import { serializeVideostrate } from "../../services/parser/serializationExecutor"
import { v4 as uuid } from "uuid"

const DefaultChat = () => {
  const {
    parsedVideostrate,
    availableClips,
    selectedClipId,
    addChatMessage,
    chatMessages,
    pendingChanges,
    seek,
  } = useStore()

  const onSend = useCallback(
    (message: string) => {
      const serialized = serializeVideostrate(parsedVideostrate, "chatGPT")
      const prompt = buildAssistantMessage(
        availableClips,
        serialized.style,
        serialized.html,
        selectedClipId,
        seek,
        message
      )
      openAIService.sendChatMessageToAzure(prompt)
      addChatMessage({
        role: "user",
        content: message,
        id: uuid(),
      })
      openAIService.sendChatMessageForReaction()
    },
    [addChatMessage, availableClips, parsedVideostrate, selectedClipId]
  )

  return (
    <Chat
      messages={chatMessages}
      onSend={onSend}
      pendingChanges={pendingChanges}
    />
  )
}

export default DefaultChat