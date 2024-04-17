import { useCallback } from "react"
import { useTimeStamp } from "../../hooks/useTimeStamp"
import { useStore } from "../../store"
import { runCommands } from "../../services/interpreter/run"
import { deleteElement as deleteElementCommand } from "../../services/interpreter/builtin/deleteElement"
import useEditCommands from "../../hooks/useEditCommands"
import { addCustomElement } from "../../services/interpreter/builtin/addCustomElement"
import clsx from "clsx"

const TimelineControls = (props: {
  zoomIn: (step: number) => void
  zoomOut: (step: number) => void
  zoomToFit: () => void
}) => {
  const { parsedVideostrate, playbackState, selectedClipId, isUiFrozen, seek } =
    useStore()
  const { execute, moveLayerDown, moveLayerUp } = useEditCommands()
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(parsedVideostrate.length)

  const moveUp = useCallback(() => {
    execute(moveLayerUp(selectedClipId!))
  }, [execute, moveLayerUp, selectedClipId])

  const moveDown = useCallback(() => {
    execute(moveLayerDown(selectedClipId!))
  }, [execute, moveLayerDown, selectedClipId])

  const deleteElement = useCallback(() => {
    if (!selectedClipId) return

    runCommands(deleteElementCommand(selectedClipId))
  }, [selectedClipId])

  const createElement = useCallback(() => {
    runCommands(addCustomElement("New element", "", seek, seek + 10))
  }, [seek])

  return (
    <div className="flex flex-row text-lg bg-base-300 border-y border-neutral p-2 ">
      <div className="w-1/3 text-left">
        {!selectedClipId && (
          <>
            <div className="tooltip" data-tip="Create custom element">
              <button className="btn btn-sm btn-ghost" onClick={createElement}>
                <i className="bi bi-plus-lg text-lg"></i>
              </button>
            </div>
          </>
        )}
        {selectedClipId && (
          <>
            <div className="tooltip" data-tip="Move up">
              <button
                className={clsx(
                  "btn btn-sm",
                  isUiFrozen ? "btn-disabled" : "btn-ghost"
                )}
                onClick={moveUp}
              >
                <i className="bi bi-layer-forward text-lg"></i>
              </button>
            </div>
            <div className="tooltip" data-tip="Move down">
              <button
                className={clsx(
                  "btn btn-sm",
                  isUiFrozen ? "btn-disabled" : "btn-ghost"
                )}
                onClick={moveDown}
              >
                <i className="bi bi-layer-backward text-lg"></i>
              </button>
            </div>
            <div className="tooltip" data-tip="Delete">
              <button
                className={clsx(
                  "btn btn-sm",
                  isUiFrozen ? "btn-disabled" : "btn-ghost"
                )}
                onClick={deleteElement}
              >
                <i className="bi bi-trash text-lg"></i>
              </button>
            </div>
          </>
        )}
      </div>
      <div className="w-1/3">
        {playbackTime} / {fullTime}
      </div>
      <div className="w-1/3 text-right">
        <div className="tooltip" data-tip="Zoom out">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => props.zoomOut(0.1)}
          >
            <i className="bi bi-zoom-out text-lg"></i>
          </button>
        </div>
        <div className="tooltip" data-tip="Zoom in">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => props.zoomIn(0.1)}
          >
            <i className="bi bi-zoom-in text-lg"></i>
          </button>
        </div>
        <div className="tooltip" data-tip="Zoom to fit">
          <button className="btn btn-sm btn-ghost" onClick={props.zoomToFit}>
            <i className="bi bi-arrows-angle-contract text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimelineControls
