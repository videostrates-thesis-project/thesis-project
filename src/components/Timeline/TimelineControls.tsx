import { useCallback, useMemo } from "react"
import { useTimeStamp } from "../../hooks/useTimeStamp"
import { executeScript } from "../../services/command/executeScript"
import { useStore } from "../../store"

const TimelineControls = (props: {
  zoomIn: (step: number) => void
  zoomOut: (step: number) => void
  zoomToFit: () => void
}) => {
  const { parsedVideostrate, playbackState, selectedClipId } = useStore()
  const playbackTime = useTimeStamp(playbackState.time)
  const fullTime = useTimeStamp(parsedVideostrate.length)
  const currentLayer = useMemo(() => {
    return parsedVideostrate.getElementById(selectedClipId!)?.layer
  }, [parsedVideostrate, selectedClipId])

  const moveLayer = useCallback((elementId: string, layer: number) => {
    executeScript([
      {
        command: "move_layer",
        args: [`"${elementId}"`, layer.toString()],
      },
    ])
  }, [])

  const isColliding = useCallback(
    (layer: number) => {
      const element = parsedVideostrate.getElementById(selectedClipId!)
      const timeStart = element!.start
      const timeEnd = element!.end
      const elements = parsedVideostrate.all.filter(
        (element) => element.layer === layer
      )
      for (const element of elements) {
        if (element.start < timeEnd && element.end > timeStart) {
          return true
        }
      }
      return false
    },
    [parsedVideostrate, selectedClipId]
  )

  const moveUp = useCallback(() => {
    if (currentLayer === undefined) return
    const layerShift = isColliding(currentLayer + 1) ? 2 : 1
    moveLayer(selectedClipId!, currentLayer + layerShift)
  }, [currentLayer, isColliding, moveLayer, selectedClipId])

  const moveDown = useCallback(() => {
    if (currentLayer === undefined) return
    const layerShift = isColliding(currentLayer - 1) ? -2 : -1
    moveLayer(selectedClipId!, currentLayer + layerShift)
  }, [currentLayer, isColliding, moveLayer, selectedClipId])

  const deleteElement = useCallback(() => {
    executeScript([
      {
        command: "delete_element",
        args: [`"${selectedClipId}"`],
      },
    ])
  }, [selectedClipId])

  return (
    <div className="flex flex-row text-lg bg-base-300 border-y border-neutral p-2 ">
      <div className="w-1/3 text-left">
        {selectedClipId && (
          <>
            <div className="tooltip" data-tip="Move up">
              <button className="btn btn-sm btn-ghost" onClick={moveUp}>
                <i className="bi bi-layer-forward text-lg"></i>
              </button>
            </div>
            <div className="tooltip" data-tip="Move down">
              <button className="btn btn-sm btn-ghost" onClick={moveDown}>
                <i className="bi bi-layer-backward text-lg"></i>
              </button>
            </div>
            <div className="tooltip" data-tip="Delete">
              <button className="btn btn-sm btn-ghost" onClick={deleteElement}>
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
