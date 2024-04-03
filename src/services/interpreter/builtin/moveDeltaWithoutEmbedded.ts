import { useStore } from "../../../store"

export const moveDeltaWithoutEmbedded = (elementId: string, delta: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[move_delta_without_embedded] Element ID must be a string")
  }
  if (typeof delta !== "number") {
    throw new Error("[move_delta_without_embedded] Delta must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.moveClipDeltaById(elementId, delta)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing move_delta_without_embedded command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `move_delta_without_embedded("${elementId}", ${delta})`
  return returnFn
}
