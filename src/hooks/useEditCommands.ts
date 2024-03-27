import { useCallback } from "react"
import { executeScript } from "../services/command/executeScript"
import { ExecutableCommand } from "../services/command/recognizedCommands"

const useEditCommands = () => {
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

  const execute = useCallback((...args: ExecutableCommand[]) => {
    executeScript(args)
  }, [])

  return {
    deleteClip,
    addClip,
    addCustomElement,
    moveDelta,
    moveDeltaWithoutEmbedded,
    cropElement,
    moveLayer,
    execute,
  }
}

export default useEditCommands
