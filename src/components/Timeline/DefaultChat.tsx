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
      openAIService.sendDefaultChatMessageToAzure(prompt)
      addChatMessage({
        role: "user",
        content: message,
        id: uuid(),
      })
      openAIService.sendChatMessageForReaction()
    },
    [addChatMessage, availableClips, parsedVideostrate, seek, selectedClipId]
  )

  return (
    <div className="w-96 min-w-96">
      <Chat
        messages={chatMessages}
        onSend={onSend}
        pendingChanges={pendingChanges}
      />
    </div>
  )
}

export default DefaultChat
