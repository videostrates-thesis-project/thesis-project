import { useCallback, useMemo } from "react"
import { useStore } from "../../store"
import { executeScript } from "../../services/command/executeScript"
import VideoClip from "../../types/videoClip"
import DeleteMediaButton from "./DeleteMediaButton"

const AvailableClip = (props: { clip: VideoClip }) => {
  const { seek, deleteAvailableClip, parsedVideostrate } = useStore()

  const canBeDeleted = useMemo(() => {
    return !parsedVideostrate.clips.some((c) => c.source === props.clip.source)
  }, [parsedVideostrate.clips, props.clip.source])

  const addToTimeline = useCallback(() => {
    if (!props.clip.title) {
      console.log("Error: No clip title")
      return
    }
    executeScript([
      {
        command: "add_clip",
        args: [`"${props.clip.title}"`, seek.toString()],
      },
    ])
  }, [props.clip.title, seek])

  const deleteClip = useCallback(() => {
    deleteAvailableClip(props.clip.source)
  }, [props.clip.source, deleteAvailableClip])

  return (
    <>
      {props.clip.status === "CACHED" ? (
        <div
          className="available-media relative flex flex-row rounded-lg overflow-clip bg-base-100"
          key={props.clip.source}
        >
          <img
            className="w-1/2 h-28 flex-grow-0 flex-shrink-0 object-cover"
            src={props.clip.thumbnailUrl}
          />

          <div className="p-2 flex flex-col w-1/2 h-full flex-grow-0 flex-shrink-0 text-left">
            <div className="overflow-hidden whitespace-nowrap text-ellipsis">
              {props.clip.title}
            </div>
            <div>{props.clip.length ?? "?"} seconds</div>
            <div className="relative -right-2 -bottom-1 flex-grow w-full flex justify-end items-end">
              <button className="btn btn-sm btn-ghost" onClick={addToTimeline}>
                <i className="bi bi-plus-lg text-lg text-accent"></i>
              </button>
            </div>
          </div>
          <DeleteMediaButton
            className="btn-ghost"
            disabled={!canBeDeleted}
            onClick={deleteClip}
          />
        </div>
      ) : (
        <div className="w-full h-28 flex justify-center items-center rounded-lg bg-base-100">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      )}
    </>
  )
}

export default AvailableClip
