import { useCallback, useState } from "react"
import openAIService from "../services/chatgpt/openai"
import { useStore } from "../store"
import { buildAssistantMessage } from "../services/chatgpt/assistantTemplate"
import { ChatGptSerializationStrategy } from "../services/serializationStrategies/chatGptSerializationStrategy"
import { MessageContentText } from "openai/resources/beta/threads/index.mjs"

const Chat = () => {
  const [message, setMessage] = useState("")
  const { parsedVideostrate, availableClips } = useStore()

  const onSend = useCallback(() => {
    const html = new ChatGptSerializationStrategy().serialize(parsedVideostrate)
    const clip_id = "bf5e68d1-165e-4ffe-8f3d-d88f3e965008"
    const prompt = buildAssistantMessage(availableClips, html, clip_id, message)
    openAIService.sendChatMessage(prompt)
    setMessage("")
  }, [availableClips, message, parsedVideostrate])

  return (
    <div className="flex flex-col min-h-96 h-96 bg-black rounded">
      {openAIService.messages.map((msg, index) => (
        <div
          key={index}
          className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
        >
          {msg.content
            .filter((q) => q.type === "text")
            .map((q) => (q as MessageContentText).text.value)
            .join("\n")}
        </div>
      ))}
      <div className="flex flex-row gap-4 mt-auto">
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
