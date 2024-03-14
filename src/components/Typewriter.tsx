import clsx from "clsx"
import { useState, useEffect } from "react"

type TypeWriterProps = {
  text: string
  minSpeed: number
  maxSpeed: number
}

export const Typewriter = ({ text, minSpeed, maxSpeed }: TypeWriterProps) => {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isTyping && displayedText.length < text.length) {
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed
      timeoutId = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
    } else if (displayedText.length === text.length) {
      setIsTyping(false)
    }

    return () => clearTimeout(timeoutId)
  }, [displayedText, text, isTyping, maxSpeed, minSpeed])

  return (
    <div>
      {displayedText}
      {displayedText.length !== text.length && (
        <span
          className={clsx("transition-[opacity]", isTyping && "animate-blink")}
        >
          |
        </span>
      )}
      <span className="opacity-0">{text.slice(displayedText.length)}</span>
    </div>
  )
}
