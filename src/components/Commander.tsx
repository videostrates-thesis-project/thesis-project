import { useCallback, useState } from "react"
import { useStore } from "../store"
import { processCommand, processScript } from "../services/commandProcessor"
import { executeScript } from "../services/command/executeScript"

const Commander = () => {
  const { parsedVideostrate, availableClips } = useStore()
  const [currentCommand, setCurrentCommand] = useState("")

  const issueCommand = useCallback(() => {
    //processCommand(currentCommand)
    /* processScript(
      '``` \nadd_custom_element("<table border=\\"1\\" style=\\"font-family: Arial; font-size: 14px; text-align: center; border-collapse: separate; border-spacing: 10px;\\"><tr style=\\"background-color: lightblue; border-radius: 10px;\\"><td><b>Name</b></td><td><b>Breed</b></td><td><b>Color</b></td></tr><tr style=\\"background-color: lightgreen; border-radius: 10px;\\"><td>Luna</td><td>Siberian</td><td>Gray</td></tr><tr style=\\"background-color: lightpink; border-radius: 10px;\\"><td>Milo</td><td>Siamese</td><td>White and brown</td></tr><tr style=\\"background-color: lightyellow; border-radius: 10px;\\"><td>Simba</td><td>Tabby</td><td>Orange</td></tr></table>", 10, 20);\n```'
    )*/
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
