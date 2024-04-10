import { useStore } from "../../../store"

export const renameElement = (elementId: string, newName: string) => {
  if (typeof elementId !== "string") {
    throw new Error("[rename_element] Element ID must be a string")
  }
  if (typeof newName !== "string") {
    throw new Error("[rename_element] New name must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

    try {
      parsedVideostrate.renameElement(elementId, newName)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing rename_element command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `rename_element("${elementId}", "${newName}")`
  return returnFn
}
