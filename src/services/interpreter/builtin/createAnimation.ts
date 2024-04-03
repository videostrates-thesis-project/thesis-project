import { useStore } from "../../../store"

export const createAnimation = (name: string, body: string) => {
  if (typeof name !== "string") {
    throw new Error("[create_animation] Name must be a string")
  }
  if (typeof body !== "string") {
    throw new Error("[create_animation] Body must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.addAnimation(name, body)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing create_animation command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `create_animation("${name}", "${body}")`
  return returnFn
}
