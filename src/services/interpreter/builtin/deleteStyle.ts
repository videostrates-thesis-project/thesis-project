import { useStore } from "../../../store"

export const deleteStyle = (selector: string) => {
  if (typeof selector !== "string") {
    throw new Error("[delete_style] Selector must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const elementId = parsedVideostrate.removeStyle(selector)
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return elementId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_style command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `delete_style("${selector}")`
  return returnFn
}
