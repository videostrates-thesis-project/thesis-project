import { useStore } from "../../../store"

export const createStyle = (selector: string, style: string) => {
  if (typeof selector !== "string") {
    throw new Error("[create_style] Selector must be a string")
  }
  if (typeof style !== "string") {
    throw new Error("[create_style] Style must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate
    try {
      const elementId = parsedVideostrate.addStyle(selector, style)
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

  returnFn.toString = () => `create_style("${selector}", "${style}")`
  return returnFn
}
