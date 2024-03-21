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
      const html = serializeVideostrate(parsedVideostrate, "chatGPT").html
      const prompt = buildAssistantMessage(
        availableClips,
        html,
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
