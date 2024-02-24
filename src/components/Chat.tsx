import { useCallback, useEffect, useRef, useState } from "react"
import openAIService from "../services/chatgpt/openai"
import { useStore } from "../store"
import { buildAssistantMessage } from "../services/chatgpt/assistantTemplate"
import { ChatGptSerializationStrategy } from "../services/serializationStrategies/chatGptSerializationStrategy"
import { MessageContentText } from "openai/resources/beta/threads/index.mjs"

const Chat = () => {
  const [message, setMessage] = useState("")
  const { parsedVideostrate, availableClips } = useStore()

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
    const html = new ChatGptSerializationStrategy().serialize(parsedVideostrate)
    const clip_id = "bf5e68d1-165e-4ffe-8f3d-d88f3e965008"
    const prompt = buildAssistantMessage(availableClips, html, clip_id, message)
    openAIService.sendChatMessage(prompt)
    setMessage("")
  }, [availableClips, message, parsedVideostrate])

  return (
    <div className="flex flex-col h-full w-96 min-w-96 max-h-full bg-base-300 border-l border-neutral rounded">
      <div className="max-h-full overflow-y-auto overflow-x-hidden break-words break-all">
        {openAIService.messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble">
              {msg.content
                .filter((q) => q.type === "text")
                .map((q) => (q as MessageContentText).text.value)
                .join("\n")}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-row mt-auto join w-full p-2">
        <textarea
          rows={1}
          ref={textAreaRef}
          value={message}
          placeholder="Ask the AI..."
          className="input input-sm join-item input-bordered w-full max-h-32 min-h-9 text-left min-w-0"
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
        />
        <button
          className="btn btn-sm btn-accent join-item px-2 h-full min-w-0"
          onClick={onSend}
        >
          <i className="bi bi-arrow-right-short text-xl"></i>
        </button>
      </div>
    </div>
  )
}

export default Chat
