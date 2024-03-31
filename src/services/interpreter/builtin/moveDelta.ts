import { useStore } from "../../../store"

export const moveDelta = (elementId: string, delta: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[move_delta] Element ID must be a string")
  }
  if (typeof delta !== "number") {
    throw new Error("[move_delta] Delta must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.moveClipWithEmbeddedDeltaById(elementId, delta)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing move_delta command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `move_delta("${elementId}", ${delta})`
  return returnFn
}
