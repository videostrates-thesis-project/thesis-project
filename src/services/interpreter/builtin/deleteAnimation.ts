import { useStore } from "../../../store"

export const deleteAnimation = (name: string) => {
  if (typeof name !== "string") {
    throw new Error("[delete_animation] Name must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.removeAnimation(name)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing delete_animation command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `delete_animation("${name}")`
  return returnFn
}
