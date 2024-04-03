import { useStore } from "../../../store"

export const setSpeed = (clipId: string, speed: number) => {
  if (typeof clipId !== "string") {
    throw new Error("[set_speed] Clip ID must be a string")
  }
  if (typeof speed !== "number") {
    throw new Error("[set_speed] Speed must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.setSpeed(clipId, speed)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing set_speed command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `set_speed("${clipId}", ${speed})`
  return returnFn
}
