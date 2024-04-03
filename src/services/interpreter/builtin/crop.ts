import { useStore } from "../../../store"

export const crop = (elementId: string, start: number, end: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[crop] Element ID must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[crop] Start time must be a number")
  }
  if (typeof end !== "number") {
    throw new Error("[crop] End time must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const newLength = parsedVideostrate.cropElementById(elementId, start, end)
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return newLength
    } catch (error) {
      console.error("[CommandProcessor] Error processing crop command: ", error)
      throw error
    }
  }

  returnFn.toString = () => `crop("${elementId}", ${start}, ${end})`
  return returnFn
}
