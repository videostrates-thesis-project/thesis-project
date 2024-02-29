import { useContext } from "react"
import { TimelineContext } from "./Timeline"
import { useTimelineElements } from "../../hooks/useTimelineElements"
import Clip from "./Clip"

const Clips = () => {
  const timeline = useContext(TimelineContext)

  const layers = useTimelineElements(timeline.widthPerSecond)

  return (
    <div className="flex flex-col gap-2 w-full my-auto py-2 overflow-y-auto">
      {layers.map((clips, layerIndex) => {
        return (
          <div
            key={layerIndex}
            className="flex flex-row relative h-12 min-h-12 w-full border border-neutral rounded-lg"
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
