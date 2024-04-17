import { useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx"
import PendingChangesBanner from "./PendingChangesBanner"
import { Typewriter } from "./Typewriter"
import { ChatMessage } from "../types/chatMessage"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useOnClickOutside } from "../hooks/useClickOutside"
import { useStore } from "../store"
import { useSelectionHint } from "../hooks/useSelectionHint"
import Sparkle from "./Sparkle"

type ChatProps = {
  onSend: (message: string) => void
  messages: ChatMessage[]
  pendingChanges?: boolean
  highlight?: {
    isEnabled: boolean
    isHighlighted: boolean
    toggleHighlight?: () => void
  }
  messageSelection?: {
    selectedChatMessage: ChatMessage | null
    setSelectedChatMessage: (msg: ChatMessage | null) => void
  }
  showSelection: boolean
  addEmoji?: (id: string, reaction: string) => void
  onNewConversation: () => void
}

const Chat = ({
  onSend,
  messages,
  pendingChanges,
  highlight = { isEnabled: false, isHighlighted: false },
  messageSelection = undefined,
  showSelection = false,
  addEmoji,
  onNewConversation,
}: ChatProps) => {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const [typewriterIndex, setTypewriterIndex] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState(false)
  const [reactionSelectorOpen, setReactionSelectorOpen] = useState<
    string | null
  >(null)
  const [reactionPopupStyle, setReactionPopupStyle] = useState({
    top: "0px",
    left: "0px",
  })

  const { selectionHint } = useSelectionHint()

  const { clearSelection } = useStore()

  const reactionRef = useRef<HTMLDivElement>(null)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleReactionClickOutside = useCallback(() => {
    setReactionSelectorOpen(null)
  }, [])
  useOnClickOutside(reactionRef, handleReactionClickOutside)

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
    e.stopPropagation() // Prevents shortcuts from being triggered when the textarea is focused
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevents adding a new line on Enter
      onTrySend()
    }
  }

  const onTrySend = useCallback(() => {
    setTypewriterIndex(null)
    setNewMessage(true)
    if (messageSelection?.selectedChatMessage) {
      messageSelection?.setSelectedChatMessage(null)
    }

    onSend(message)

    setMessage("")
    setLoading(true)
  }, [message, onSend, messageSelection])

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

  const openReactionSelector = useCallback(
    (id: string | null, event?: React.MouseEvent<HTMLDivElement>) => {
      if (event && id) {
        const x = event.clientX
        const y = event.clientY + 20
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        // These dimensions should ideally be dynamic or set based on the size of your popup
        const popupWidth = 298 // Replace with your popup's actual width if dynamic
        const popupHeight = 435 // Replace with your popup's actual height if dynamic

        let adjustedX = x
        let adjustedY = y

        // Adjust if the popup goes beyond the right edge of the screen
        if (x + popupWidth > screenWidth) {
          adjustedX -= popupWidth
        }

        // Adjust if the popup goes beyond the bottom edge of the screen
        if (y + popupHeight > screenHeight) {
          adjustedY -= popupHeight
        }

        setReactionPopupStyle({
          top: adjustedY + "px",
          left: adjustedX + "px",
        })
      }
      setReactionSelectorOpen((prev) => (prev === id ? null : id))
    },
    []
  )

  const addEmojiToMessage = useCallback(
    (id: string, reaction: string) => {
      setReactionSelectorOpen(null)
      addEmoji?.(id, reaction)
    },
    [addEmoji]
  )

  const startNewConversation = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to start a new conversation? Your message history will be lost."
      )
    ) {
      onNewConversation()
    }
  }, [onNewConversation])

  const onSelectReply = useCallback(
    (msg: ChatMessage) => {
      if (messageSelection?.selectedChatMessage === msg) {
        messageSelection.setSelectedChatMessage(null)
      } else {
        messageSelection?.setSelectedChatMessage(msg)
      }
    },
    [messageSelection]
  )

  return (
    <div className="flex flex-col h-full max-h-full bg-base-300 border-l border-neutral rounded">
      <div className="flex flex-row w-full bg-base-100 p-2">
        <button
          className="ml-auto btn btn-xs btn-accent group text-xs"
          onClick={startNewConversation}
        >
          <i className="bi bi-arrow-clockwise group-hover:animate-spin"></i>
          Start new conversation
        </button>
      </div>
      <div className="pt-4 max-h-full overflow-y-auto overflow-x-hidden break-words break-all">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "chat pb-4 pl-4",
              msg.role === "user" ? "chat-end" : "chat-start"
            )}
          >
            <div className="flex justify-center items-center">
              {messageSelection && msg.role === "user" && (
                <button
                  className="btn btn-ghost btn-sm w-8 mr-2"
                  onClick={() => onSelectReply(msg)}
                >
                  <i className="bi bi-reply text-lg text-neutral-content" />
                </button>
              )}

              <div
                className={clsx(
                  "chat-bubble text-left break-normal text-sm relative pb-4",
                  msg.role === "user" && "chat-bubble-primary"
                )}
              >
                <div
                  className={clsx(
                    "absolute w-full h-full top-0 left-0 rounded-2xl",
                    msg === messageSelection?.selectedChatMessage
                      ? "!border-accent border-2 radius-2"
                      : "border-0"
                  )}
                ></div>

                {msg.role === "assistant" &&
                typewriterIndex === index &&
                newMessage ? (
                  <Typewriter text={msg.content} minSpeed={5} maxSpeed={40} />
                ) : (
                  msg.content
                )}

                {!msg.reaction && msg.role === "assistant" && (
                  <div
                    onClick={(event) => openReactionSelector(msg.id, event)}
                    className={clsx(
                      "animate-shrink text-[1.2rem] absolute right-2 -bottom-4 bg-neutral rounded-full border-base-300 border-2 flex justify-center items-center cursor-pointer hover:text-white transition-all"
                    )}
                    style={{
                      paddingTop: "2px",
                      width: "36px",
                      height: "36px",
                    }}
                  >
                    <i className="bi bi-plus-lg text-lg"></i>
                  </div>
                )}
                {reactionSelectorOpen === msg.id && (
                  <div
                    ref={reactionRef}
                    className="fixed z-10"
                    style={{
                      top: reactionPopupStyle.top,
                      left: reactionPopupStyle.left,
                    }}
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={(e: { native: string }) => {
                        addEmojiToMessage?.(
                          msg.id,
                          e.native === msg.reaction ? "" : e.native
                        )
                      }}
                      emojiButtonSize={30}
                      emojiSize={20}
                      maxFrequentRows={1}
                      perLine={9}
                      previewPosition="none"
                    />
                  </div>
                )}

                {msg.reaction && (
                  <div
                    className={clsx(
                      "animate-shrink text-[1.2rem] absolute -bottom-4 bg-neutral rounded-full border-base-300 border-2",
                      msg.role === "user" ? "left-2" : "right-2",
                      msg.role === "assistant" && "cursor-pointer"
                    )}
                    style={{
                      padding: "5px",
                      paddingBottom: "3.5px",
                    }}
                    onClick={
                      msg.role === "assistant"
                        ? (event) => openReactionSelector(msg.id, event)
                        : () => {}
                    }
                  >
                    {msg.reaction}
                  </div>
                )}
              </div>

              {messageSelection && msg.role === "assistant" && (
                <button
                  className="btn btn-ghost btn-sm w-8 ml-2"
                  onClick={() => onSelectReply(msg)}
                >
                  <i className="bi bi-reply text-lg text-neutral-content" />
                </button>
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

        {showSelection && selectionHint && (
          <div className="flex flex-row items-center h-8 w-full bg-base-100 rounded-lg text-gray-500">
            <div className="p-2 text-sm w-full text-left overflow-hidden whitespace-nowrap text-ellipsis">
              {selectionHint}
            </div>

            <button
              className="btn btn-sm btn-error rounded-none rounded-r-lg w-9"
              onClick={() => clearSelection()}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        {messageSelection?.selectedChatMessage && (
          <div className="flex flex-row items-center h-8 w-full bg-base-100 rounded-lg text-gray-500">
            <div className="rounded-none rounded-l-lg  rotate-180 h-full w-8">
              <i className="bi bi-reply"></i>
            </div>

            <div className="p-2 text-sm w-full text-left">
              {messageSelection.selectedChatMessage.content.length > 43
                ? messageSelection.selectedChatMessage.content.slice(0, 43) +
                  "..."
                : messageSelection.selectedChatMessage.content}
            </div>

            <button
              className="btn btn-sm btn-error rounded-none rounded-r-lg  w-9"
              onClick={() => messageSelection.setSelectedChatMessage(null)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        )}

        <div className="flex flex-row join w-full relative">
          {highlight.isEnabled && (
            <button
              className={clsx(
                "btn btn-sm btn-warning join-item px-2 h-full min-w-0",
                !highlight.isHighlighted && "btn-disabled"
              )}
              onClick={highlight.toggleHighlight}
            >
              <i className="bi bi-x text-xl"></i>
            </button>
          )}
          <textarea
            rows={1}
            ref={textAreaRef}
            value={message}
            placeholder="        Ask the AI..."
            className="input input-sm join-item input-bordered w-full max-h-32 min-h-8 text-left min-w-0 leading-7"
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
          />
          {!message && <Sparkle className="top-1 left-4" />}
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
