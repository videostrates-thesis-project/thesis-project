import { useCallback } from "react"
import { executeScript } from "../services/command/executeScript"
import { ExecutableCommand } from "../services/command/recognizedCommands"
import { useStore } from "../store"

const useEditCommands = () => {
  const { parsedVideostrate } = useStore()

  const deleteClip = useCallback(
    (clipId: string): ExecutableCommand => ({
      command: "delete_element",
      args: [`"${clipId}"`],
    }),
    []
  )

  const addClip = useCallback(
    (clipTitle: string, time: number): ExecutableCommand => ({
      command: "add_clip",
      args: [`"${clipTitle}"`, time.toString()],
    }),
    []
  )

  const addCustomElement = useCallback(
    (
      elementName: string,
      elementContent: string,
      time: number,
      end: number
    ): ExecutableCommand => ({
      command: "add_custom_element",
      args: [
        `"${elementName}"`,
        `"${elementContent}"`,
        time.toString(),
        end.toString(),
      ],
    }),
    []
  )

  const moveDelta = useCallback(
    (elementId: string, delta: number): ExecutableCommand => ({
      command: "move_delta",
      args: [`"${elementId}"`, delta.toString()],
    }),
    []
  )

  const cropElement = useCallback(
    (elementId: string, start: number, end: number): ExecutableCommand => ({
      command: "crop",
      args: [`"${elementId}"`, start.toString(), end.toString()],
    }),
    []
  )

  const moveDeltaWithoutEmbedded = useCallback(
    (elementId: string, delta: number): ExecutableCommand => ({
      command: "move_delta_without_embedded",
      args: [`"${elementId}"`, delta.toString()],
    }),
    []
  )

  const moveLayer = useCallback(
    (elementId: string, layer: number): ExecutableCommand => ({
      command: "move_layer",
      args: [`"${elementId}"`, layer.toString()],
    }),
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
    (elementId: string): ExecutableCommand | undefined => {
      const currentLayer = parsedVideostrate.getElementById(elementId)?.layer
      if (currentLayer === undefined) return
      const layerShift = isColliding(elementId, currentLayer + 1) ? 2 : 1
      return moveLayer(elementId, currentLayer + layerShift)
    },
    [isColliding, moveLayer, parsedVideostrate]
  )

  const moveLayerDown = useCallback(
    (elementId: string): ExecutableCommand | undefined => {
      const currentLayer = parsedVideostrate.getElementById(elementId)?.layer
      if (currentLayer === undefined) return
      const layerShift = isColliding(elementId, currentLayer - 1) ? -2 : -1
      return moveLayer(elementId, currentLayer + layerShift)
    },
    [isColliding, moveLayer, parsedVideostrate]
  )

  const execute = useCallback((...args: (ExecutableCommand | undefined)[]) => {
    executeScript(args.filter((c): c is ExecutableCommand => c !== undefined))
  }, [])

  return {
    deleteClip,
    addClip,
    addCustomElement,
    moveDelta,
    moveDeltaWithoutEmbedded,
    cropElement,
    moveLayer,
    moveLayerUp,
    moveLayerDown,
    execute,
  }
}

export default useEditCommands
