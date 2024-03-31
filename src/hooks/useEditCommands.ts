import { useCallback } from "react"
import { useStore } from "../store"
import { runCommands } from "../services/interpreter/run"
import { moveLayer as moveLayerCommand } from "../services/interpreter/builtin/moveLayer"

const useEditCommands = () => {
  const { parsedVideostrate } = useStore()

  const moveLayer = useCallback(
    (elementId: string, layer: number) => moveLayerCommand(elementId, layer),
    []
  )

  const isColliding = useCallback(
    (elementId: string, layer: number) => {
      const element = parsedVideostrate.getElementById(elementId)
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
    [parsedVideostrate]
  )

  const moveLayerUp = useCallback(
    (elementId: string) => {
      const currentLayer = parsedVideostrate.getElementById(elementId)?.layer
      if (currentLayer === undefined) return
      const layerShift = isColliding(elementId, currentLayer + 1) ? 2 : 1
      return moveLayer(elementId, currentLayer + layerShift)
    },
    [isColliding, moveLayer, parsedVideostrate]
  )

  const moveLayerDown = useCallback(
    (elementId: string) => {
      const currentLayer = parsedVideostrate.getElementById(elementId)?.layer
      if (currentLayer === undefined) return
      const layerShift = isColliding(elementId, currentLayer - 1) ? -2 : -1
      return moveLayer(elementId, currentLayer + layerShift)
    },
    [isColliding, moveLayer, parsedVideostrate]
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = useCallback((...args: any[]) => {
    runCommands(...args)
  }, [])

  return {
    moveLayer,
    moveLayerUp,
    moveLayerDown,
    execute,
  }
}

export default useEditCommands
