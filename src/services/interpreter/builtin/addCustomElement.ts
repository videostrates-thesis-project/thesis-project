import { useStore } from "../../../store"

export const addCustomElement = (
  name: string,
  content: string,
  start: number,
  end: number
) => {
  if (typeof name !== "string") {
    throw new Error("[add_custom_element] Name must be a string")
  }
  if (typeof content !== "string") {
    throw new Error("[add_custom_element] Content must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[add_custom_element] Start time must be a number")
  }
  if (typeof end !== "number") {
    throw new Error("[add_custom_element] End time must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const elementId = parsedVideostrate.addCustomElement(
        name,
        content,
        start,
        end
      )
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return elementId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_custom_element command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `add_custom_element("${name}", "${content}", ${start}, ${end})`
  return returnFn
}
