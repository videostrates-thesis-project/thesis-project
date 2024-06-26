import { useContext, useEffect } from "react"
import { TimelineContext } from "./Timeline"
import { useTimelineElements } from "../../hooks/useTimelineElements"
import Clip from "./Clip"

const Clips = () => {
  const timeline = useContext(TimelineContext)
  const layers = useTimelineElements(timeline.widthPerSecond)

  useEffect(() => {
    console.log("Clips - New layers", layers)
  }, [layers])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  return (
    <div
      className="flex flex-col gap-2 w-full my-auto py-2 overflow-y-auto"
      onDragOver={onDragOver}
    >
      {layers.map((clips, layerIndex) => {
        return (
          <div
            key={layerIndex}
            className="flex flex-row relative h-fit w-full border border-neutral rounded-lg"
          >
            {clips.map((clip) => {
              return <Clip key={clip.id} clip={clip} />
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Clips
