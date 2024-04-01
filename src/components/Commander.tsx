import { useCallback, useEffect, useRef, useState } from "react"
import { useStore } from "../store"
import { parseAndExecuteScript } from "../services/command/executeScript"
import { ExecutableCommand } from "../services/command/recognizedCommands"

const Commander = () => {
  const { undoStack } = useStore()
  const [currentCommand, setCurrentCommand] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current
    if (textArea) {
      textArea.style.height = "auto" // Reset height to recalculate
      textArea.style.height = textArea.scrollHeight + 2 + "px" // Set new height
    }
  }

  useEffect(() => {
    adjustTextAreaHeight()
  }, [currentCommand])

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [undoStack.length])

  const getCommandString = useCallback((line: ExecutableCommand) => {
    return (
      (line.variable ? `${line.variable} = ` : "") +
      `${line.command}(${line.args.join(", ")})`
    )
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault() // Prevents moving the cursor to the beginning of the line
      if (undoStack.length > 0) {
        setCurrentCommand(
          getCommandString(undoStack[undoStack.length - 1].script[0])
        )
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Prevents adding a new line on Enter
      issueCommand()
    }
  }

  const issueCommand = useCallback(() => {
    parseAndExecuteScript(currentCommand)
    setCurrentCommand("")
  }, [currentCommand])

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col font-mono overflow-y-auto overflow-x-hidden mb-4">
        {undoStack.map((command, i) => (
          <div key={i} className="flex flex-col bg-neutral rounded p-2 mt-2">
            {command.script.map((line, j) => (
              <div key={j} className="text-[11px] text-start select-all">
                <span className="opacity-50 mr-2 select-none">{j + 1}</span>
                {getCommandString(line)}
              </div>
            ))}
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="flex flex-row join mt-auto w-full">
        <textarea
          ref={textAreaRef}
          placeholder="Write your script here..."
          className="textarea textarea-bordered w-full max w-xs text-white join-item text-xs font-mono"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-sm btn-accent join-item h-full"
          onClick={issueCommand}
        >
          <i className="bi bi-arrow-right-short text-xl"></i>
        </button>
      </div>
    </div>
  )
}

export default Commander
