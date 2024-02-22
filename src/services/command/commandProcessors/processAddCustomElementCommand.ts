import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processAddCustomElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const content = determineReturnValue(args[0], context)
  if (content.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const start = determineReturnValue(args[1], context)
  const end = determineReturnValue(args[2], context)
  if (start.type !== "number" || end.type !== "number") {
    throw new Error("Second and third arguments must be numbers")
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(content.value, "text/html")
  const htmlElement = document.body.firstChild as HTMLElement
  const parent = htmlElement.parentNode
  const wrapper = document.createElement("div")
  // TODO: determine z-index based on where it's added in the timeline
  wrapper.style.zIndex = "1"
  parent?.replaceChild(wrapper, htmlElement)
  wrapper.appendChild(htmlElement)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const elementId = parsedVideostrate.addCustomElement(
      wrapper.outerHTML,
      start.value,
      end.value
    )
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: elementId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_custom_element command: ",
      error
    )
  }
}
