import { useStore } from "../../../store"

export const reposition = (elementId: string, start: number, end: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[reposition] Element ID must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[reposition] Start must be a number")
  }
  if (typeof end !== "number") {
    throw new Error("[reposition] End must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.repositionClipById(elementId, start, end)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error("[CommandProcessor] Error processing move command: ", error)
      throw error
    }
  }

  returnFn.toString = () => `reposition("${elementId}", ${start}, ${end})`
  return returnFn
}
