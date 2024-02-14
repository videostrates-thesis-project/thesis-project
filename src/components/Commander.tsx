import { useCallback, useMemo, useState } from "react"
import { useStore } from "../store"
import { processCommand } from "../services/commandProcessor"

const Commander = () => {
  const { parsedVideostrate } = useStore()
  const [currentCommand, setCurrentCommand] = useState("")

  const uniqueUrls = useMemo(() => {
    return Array.from(
      new Set(parsedVideostrate.clips.map((clip) => clip.source))
    )
  }, [parsedVideostrate.clips])

  const issueCommand = useCallback(() => {
    processCommand(currentCommand)
    setCurrentCommand("")
  }, [currentCommand])

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-8">
        <div className="flex flex-col p-2 w-96 bg-blue-200 rounded">
          <h2 className="card-title">Available clips to import:</h2>
          <ul>
            {uniqueUrls.map((url, index) => {
              return <li key={index}>{url}</li>
            })}
          </ul>
        </div>

        <div className="flex flex-col p-2 w-96 bg-blue-200 rounded">
          <h2 className="card-title">Available clips to move/delete/crop:</h2>
          <ul>
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
      <input
        type="text"
        placeholder="Write your command here..."
        className="input input-bordered w-1/2 max w-xs text-white mt-4"
        value={currentCommand}
        onChange={(e) => setCurrentCommand(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            issueCommand()
          }
        }}
      />
    </div>
  )
}

export default Commander
