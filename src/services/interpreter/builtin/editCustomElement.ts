import { useStore } from "../../../store"

export const editCustomElement = (id: string, content: string) => {
  if (typeof id !== "string") {
    throw new Error("[edit_custom_element] ID must be a string")
  }
  if (typeof content !== "string") {
    throw new Error("[edit_custom_element] Content must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

    try {
      const elementId = parsedVideostrate.updateCustomElement(id, content)
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return elementId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing edit_custom_element command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `edit_custom_element("${id}", "${content}")`
  return returnFn
}
