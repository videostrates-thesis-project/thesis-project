import { useContext } from "react"
import { TimelineContext } from "../../Timeline"
import { useTimelineElements } from "../../../hooks/useTimelineElements"

const Clips = () => {
  const timeline = useContext(TimelineContext)

  const layers = useTimelineElements(timeline.widthPerSecond)

  return (
    <div className="flex flex-col gap-2 w-full">
      {layers.map((clips) => {
        return (
          <div className="flex flex-row relative h-14 w-full border border-neutral rounded-md">
            {clips.map((clip) => {
              return (
                <>
                  {clip.type !== "video" && (
                    <div
                      key={clip.id}
                      className="absolute m-0 h-full bg-green-500 rounded-md text-white flex justify-start items-center"
                      style={{
                        width: `${clip.width}px`,
                        left: `${clip.left}px`,
                      }}
                    >
                      {clip.type} {clip.nodeType}
                    </div>
                  )}
                  {clip.type === "video" && (
                    <div
                      key={clip.id}
                      className="absolute h-full border-2 border-neutral rounded-md"
                      style={{
                        width: `${clip.width}px`,
                        left: `${clip.left}px`,
                        backgroundImage: `url(${clip.thumbnail})`,
                        backgroundSize: "auto 100%",
                      }}
                    ></div>
                  )}
                </>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Clips
