import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processAddCustomElementCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
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
  let htmlElement = document.body.firstChild as HTMLElement
  htmlElement = cleanTree(htmlElement)
  const parent = htmlElement.parentNode
  const wrapper = document.createElement("div")
  // TODO: determine z-index based on where it's added in the timeline
  wrapper.style.zIndex = "1"
  parent?.replaceChild(wrapper, htmlElement)
  wrapper.appendChild(htmlElement)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    const elementId = parsedVideostrate.addCustomElement(
      wrapper.outerHTML,
      start.value,
      end.value
    )
    workingContext.setVideostrate(parsedVideostrate)

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

const cleanTree = (element: HTMLElement) => {
  if (element?.childNodes) {
    element.childNodes.forEach(
      (childNode) => (childNode = cleanTree(childNode as HTMLElement))
    )
  }

  if (
    element.className &&
    element.className.startsWith('\\"') &&
    element.className.endsWith('\\"')
  ) {
    element.className = element.className.slice(2, -2)
  }

  return element
}
