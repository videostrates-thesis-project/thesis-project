import { useStore } from "../../../store"

export const move = (elementId: string, start: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[move] Element ID must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[move] Start must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.moveClipById(elementId, start)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error("[CommandProcessor] Error processing move command: ", error)
      throw error
    }
  }

  returnFn.toString = () => `move("${elementId}", ${start})`
  return returnFn
}
