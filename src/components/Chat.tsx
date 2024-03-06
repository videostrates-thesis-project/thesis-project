import { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx"
import openAIService from "../services/chatgpt/openai"
import { useStore } from "../store"
import { buildAssistantMessage } from "../services/chatgpt/assistantTemplate"
import { ChatGptSerializationStrategy } from "../services/serializationStrategies/chatGptSerializationStrategy"
import PendingChangesBanner from "./PendingChangesBanner"

const Chat = () => {
  const [message, setMessage] = useState("")
  const {
    parsedVideostrate,
    availableClips,
    chatMessages,
    addChatMessage,
    selectedClipId,
    pendingChanges,
  } = useStore()

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current
    if (textArea) {
      textArea.style.height = "auto" // Reset height to recalculate
      textArea.style.height = textArea.scrollHeight + 2 + "px" // Set new height
    }
  }

  useEffect(() => {
    adjustTextAreaHeight()
  }, [message])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevents adding a new line on Enter
      onSend()
    }
  }

  const onSend = useCallback(() => {
    const html = new ChatGptSerializationStrategy().serializeHtml(
      parsedVideostrate
    )
    const prompt = buildAssistantMessage(
      availableClips,
      html,
      selectedClipId,
      message
    )
    openAIService.sendChatMessage(prompt)
    addChatMessage({
      role: "user",
      content: message,
    })
    setMessage("")
  }, [
    addChatMessage,
    availableClips,
    message,
    parsedVideostrate,
    selectedClipId,
  ])

  return (
    <div className="flex flex-col h-full w-96 min-w-96 max-h-full bg-base-300 border-l border-neutral rounded">
      <div className="pt-4 max-h-full overflow-y-auto overflow-x-hidden break-words break-all">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "chat",
              msg.role === "user" ? "chat-end" : "chat-start"
            )}
          >
            <div
              className={clsx(
                "chat-bubble text-left break-normal text-sm",
                msg.role === "user" && "chat-bubble-primary"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 w-full mt-auto p-2">
        {pendingChanges && <PendingChangesBanner />}

        <div className="flex flex-row join w-full">
          <textarea
            rows={1}
            ref={textAreaRef}
            value={message}
            placeholder="Ask the AI..."
            className="input input-sm join-item input-bordered w-full max-h-32 min-h-8 text-left min-w-0 leading-7"
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
          />
          <button
            className={clsx(
              "btn btn-sm btn-accent join-item px-2 h-full min-w-0",
              !message && "btn-disabled"
            )}
            onClick={onSend}
          >
            <i className="bi bi-arrow-right-short text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
