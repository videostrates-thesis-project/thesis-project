import { useCallback, useMemo } from "react"
import { useStore } from "../../store"
import VideoClip from "../../types/videoClip"
import DeleteMediaButton from "./DeleteMediaButton"
import { runCommands } from "../../services/interpreter/run"
import { addClip } from "../../services/interpreter/builtin/addClip"
import clsx from "clsx"
import AddElementButton from "./AddElementButton"

const AvailableClip = (props: { clip: VideoClip }) => {
  const { seek, deleteAvailableClip, parsedVideostrate } = useStore()
  const { selectedImportableClipName, setSelectedImportableClipName } =
    useStore()

  const isSelected = useMemo(
    () => selectedImportableClipName === props.clip.title,
    [selectedImportableClipName, props.clip.title]
  )

  const canBeDeleted = useMemo(() => {
    return !parsedVideostrate.clips.some((c) => c.source === props.clip.source)
  }, [parsedVideostrate.clips, props.clip.source])

  const addToTimeline = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation()
      if (!props.clip.title) {
        console.log("Error: No clip title")
        return
      }
      runCommands(addClip(props.clip.title, seek))
    },
    [props.clip.title, seek]
  )

  const deleteClip = useCallback(() => {
    deleteAvailableClip(props.clip.source)
  }, [props.clip.source, deleteAvailableClip])

  return (
    <>
      {props.clip.status === "CACHED" ? (
        <div
          className="h-full tooltip tooltip-bottom"
          data-tip="Click to select as chat context"
        >
          <div
            className={clsx(
              "available-media relative flex flex-row rounded-lg overflow-clip bg-base-100 border-2 cursor-pointer  h-full",
              isSelected
                ? "!border-accent"
                : "border-base-100 hover:border-gray-300"
            )}
            key={props.clip.source}
            onClick={() => {
              if (isSelected) setSelectedImportableClipName(null)
              else setSelectedImportableClipName(props.clip.title)
            }}
          >
            <img
              className="w-1/2 h-28 flex-grow-0 flex-shrink-0 object-cover"
              src={props.clip.thumbnailUrl}
            />

            <div className="p-2 w-1/2 h-full flex flex-col justify-between flex-grow-1 flex-shrink-0 text-left">
              <div className="overflow-hidden whitespace-nowrap text-ellipsis">
                {props.clip.title}
              </div>
              <div>{props.clip.length ?? "?"} seconds</div>
              <div className="relative -right-1 -bottom-1  w-full flex justify-end items-end mt-auto">
                <AddElementButton onClick={addToTimeline} time={seek} />
              </div>
            </div>
            <DeleteMediaButton disabled={!canBeDeleted} onClick={deleteClip} />
          </div>
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
