import { useCallback, useState } from "react"
import { useStore } from "../store"
import { executeScript } from "../services/command/executeScript"

const Commander = () => {
  const { parsedVideostrate, availableClips } = useStore()
  const [currentCommand, setCurrentCommand] = useState("")

  const issueCommand = useCallback(() => {
    executeScript(currentCommand)
    setCurrentCommand("")
  }, [currentCommand])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-8">
        <div className="flex flex-col flex-grow p-2 w-96 bg-neutral rounded">
          <div className="card-body text-left">
            <h2 className="card-title">Available clips to import:</h2>
            <ul className="list-disc">
              {availableClips.map((clip, index) => {
                const formattedTitle = `${clip.title || clip.source} - ${clip.length?.toFixed(0)} seconds`
                return <li key={index}>{formattedTitle}</li>
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-2 w-96 bg-neutral rounded">
          <div className="card-body text-left">
            <h2 className="card-title">Available clips to move/delete/crop:</h2>
            <ul className="list-disc">
              {parsedVideostrate.clips.map((clip, index) => {
                return (
                  <li key={index}>
                    {clip.id}: {clip.start} - {clip.end}{" "}
                    <p className="text-xs">{clip.source}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      <textarea
        placeholder="Write your command here..."
        className="textarea textarea-bordered w-1/2 max w-xs text-white mt-4"
        value={currentCommand}
        onChange={(e) => setCurrentCommand(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            issueCommand()
          }
        }}
      />
      <button className="btn btn-primary mt-4" onClick={issueCommand}>
        Send
      </button>
    </div>
  )
}

export default Commander
