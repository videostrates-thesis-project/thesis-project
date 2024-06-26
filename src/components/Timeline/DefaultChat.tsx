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
    clipsMetadata,
    availableImages,
    availableCustomElements,
    selectedClip,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
    selectedChatMessage,
    setSelectedChatMessage,
    addChatMessage,
    chatMessages,
    pendingChanges,
    playbackState,
    addReactionToMessage,
    resetMessages,
    clearSelection,
  } = useStore()

  const onSend = useCallback(
    (message: string) => {
      const serialized = serializeVideostrate(parsedVideostrate, "chatGPT")
      const prompt = buildAssistantMessage(
        clipsMetadata,
        availableImages,
        availableCustomElements,
        serialized.style,
        serialized.html,
        selectedClip?.id ?? null,
        selectedImportableClipName,
        selectedImportableImage,
        selectedImportableCustomElement,
        selectedChatMessage,
        playbackState.time,
        message
      )
      openAIService.sendChatMessage(prompt).catch((error) => {
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
    [
      parsedVideostrate,
      clipsMetadata,
      availableImages,
      availableCustomElements,
      selectedClip?.id,
      selectedImportableClipName,
      selectedImportableImage,
      selectedImportableCustomElement,
      selectedChatMessage,
      playbackState.time,
      addChatMessage,
      chatMessages,
      clearSelection,
    ]
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
