import { useCallback } from "react"
import Chat from "../Chat"
import { useStore } from "../../store"
import { buildAssistantMessage } from "../../services/chatgpt/assistantTemplate"
import openAIService from "../../services/chatgpt/openai"
import { serializeVideostrate } from "../../services/parser/serializationExecutor"
import { v4 as uuid } from "uuid"
import { ChatMessage } from "../../types/chatMessage"

const DefaultChat = () => {
  const {
    parsedVideostrate,
    availableClips,
    selectedClipId,
    addChatMessage,
    chatMessages,
    pendingChanges,
    seek,
    addReactionToMessage,
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
      openAIService.sendDefaultChatMessageToAzure(prompt)
      const latestMessage: ChatMessage = {
        role: "user",
        content: message,
        id: uuid(),
      }
      addChatMessage(latestMessage)
      openAIService.sendChatMessageForReaction(
        [...chatMessages, latestMessage],
        useStore.getState().addReactionToMessage
      )
    },
    [
      addChatMessage,
      availableClips,
      chatMessages,
      parsedVideostrate,
      seek,
      selectedClipId,
    ]
  )

  const addEmoji = useCallback(
    (id: string, reaction: string) => {
      addReactionToMessage(id, reaction)
    },
    [addReactionToMessage]
  )

  return (
    <div className="w-96 min-w-96">
      <Chat
        messages={chatMessages}
        onSend={onSend}
        pendingChanges={pendingChanges}
        addEmoji={addEmoji}
      />
    </div>
  )
}

export default DefaultChat
