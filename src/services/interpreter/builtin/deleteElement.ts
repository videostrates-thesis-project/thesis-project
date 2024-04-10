import { useStore } from "../../../store"

export const deleteElement = (elementId: string) => {
  if (typeof elementId !== "string") {
    throw new Error("[delete_element] Element ID must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.deleteElementById(elementId)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing delete_element command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `delete_element("${elementId}")`
  return returnFn
}
