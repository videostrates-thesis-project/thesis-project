import { useStore } from "../../../store"

export const addSubtitle = (text: string, start: number, end: number) => {
  if (typeof text !== "string") {
    throw new Error("[add_subtitle] Text must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[add_subtitle] Start time must be a number")
  }
  if (typeof end !== "number") {
    throw new Error("[add_subtitle] End time must be a number")
  }

  const returnFn = () => {
    const parser = new DOMParser()
    const document = parser.parseFromString(
      `<span class="subtitle">${text}</span>`,
      "text/html"
    )
    const htmlElement = document.body.firstChild as HTMLElement

    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const elementId = parsedVideostrate.addCustomElement(
        "Subtitle",
        htmlElement.outerHTML,
        start,
        end,
        "subtitle",
        "span"
      )
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return elementId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_subtitle command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `add_subtitle("${text}", ${start}, ${end})`
  return returnFn
}
