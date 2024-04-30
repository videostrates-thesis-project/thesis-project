import { useCallback } from "react"
import Chat from "../Chat"
import { useStore } from "../../store"
import openAIService from "../../services/chatgpt/openai"
import openAIServiceUncontrolled from "../../services/chatgpt/openaiUncontrolled"
import { v4 as uuid } from "uuid"
import { ChatMessage } from "../../types/chatMessage"

const DefaultChat = () => {
  const {
    selectedChatMessage,
    setSelectedChatMessage,
    addChatMessage,
    chatMessages,
    pendingChanges,
    addReactionToMessage,
    resetMessages,
    clearSelection,
  } = useStore()

  const onSend = useCallback(
    (message: string) => {
      openAIServiceUncontrolled
        .sendScriptExecutionMessage(message)
        .catch((error) => {
          addChatMessage({
            role: "assistant",
            content: "There was an error processing your request: " + error,
            id: uuid(),
          })
        })
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
      clearSelection()
    },
    [addChatMessage, chatMessages, clearSelection]
  )

  const addEmoji = useCallback(
    (id: string, reaction: string) => {
      addReactionToMessage(id, reaction)
    },
    [addReactionToMessage]
  )

  const onStartNewconversation = useCallback(() => {
    resetMessages()
    clearSelection()
  }, [clearSelection, resetMessages])

  return (
    <div className="w-96 min-w-96">
      <Chat
        messages={chatMessages}
        onSend={onSend}
        pendingChanges={pendingChanges}
        addEmoji={addEmoji}
        messageSelection={{
          selectedChatMessage: selectedChatMessage,
          setSelectedChatMessage: setSelectedChatMessage,
        }}
        showSelection={true}
        onNewConversation={onStartNewconversation}
      />
    </div>
  )
}

export default DefaultChat
