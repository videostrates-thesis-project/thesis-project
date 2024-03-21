import { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx"
import PendingChangesBanner from "./PendingChangesBanner"
import { Typewriter } from "./Typewriter"
import { ChatMessage } from "../types/chatMessage"

type ChatProps = {
  onSend: (message: string) => void
  messages: ChatMessage[]
  pendingChanges?: boolean
}

const Chat = ({ onSend, messages, pendingChanges }: ChatProps) => {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const [typewriterIndex, setTypewriterIndex] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState(false)

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
      onTrySend()
    }
  }

  const onTrySend = useCallback(() => {
    setTypewriterIndex(null)
    setNewMessage(true)

    onSend(message)

    setMessage("")
    setLoading(true)
  }, [message, onSend])

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" })
    }
    if (messages.at(-1)?.role === "assistant") {
      setLoading(false)
      setTypewriterIndex(messages.length - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  useEffect(() => {
    if (loading && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [loading])

  return (
    <div className="flex flex-col h-full w-96 min-w-96 max-h-full bg-base-300 border-l border-neutral rounded">
      <div className="pt-4 max-h-full overflow-y-auto overflow-x-hidden break-words break-all">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "chat",
              msg.role === "user" ? "chat-end" : "chat-start",
              msg.reaction && "pb-4"
            )}
          >
            <div
              className={clsx(
                "chat-bubble text-left break-normal text-sm relative pb-4",
                msg.role === "user" && "chat-bubble-primary"
              )}
            >
              {msg.role === "assistant" &&
              typewriterIndex === index &&
              newMessage ? (
                <Typewriter text={msg.content} minSpeed={5} maxSpeed={40} />
              ) : (
                msg.content
              )}

              {msg.reaction && (
                <div
                  className="animate-shrink text-[1.2rem] absolute left-2 -bottom-4 bg-neutral rounded-full border-base-300 border-2"
                  style={{
                    padding: "5px",
                    paddingBottom: "3.5px",
                  }}
                >
                  {msg.reaction}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat chat-start">
            <div className="chat-bubble text-left break-normal text-sm relative pb-2 flex justify-center items-center">
              <div className="flex flex-row gap-1 -mb-2">
                <div className="w-2 h-2 bg-neutral-content rounded-full animate-bounce-big" />
                <div
                  className="w-2 h-2 bg-neutral-content rounded-full animate-bounce-big"
                  style={{ animationDelay: "100ms" }}
                />
                <div
                  className="w-2 h-2 bg-neutral-content rounded-full animate-bounce-big delay-200"
                  style={{ animationDelay: "200ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div className="mt-2" ref={endRef} />
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
            onClick={onTrySend}
          >
            <i className="bi bi-arrow-right-short text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
