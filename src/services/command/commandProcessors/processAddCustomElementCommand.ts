import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processAddCustomElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 4) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValue(args[0], context)
  if (name.type !== "string") {
    throw new Error("First argument must be a string")
  }

  const content = determineReturnValue(args[1], context)
  if (content.type !== "string") {
    throw new Error("Second argument must be a string")
  }
  const start = determineReturnValue(args[2], context)
  const end = determineReturnValue(args[3], context)
  if (start.type !== "number" || end.type !== "number") {
    throw new Error("Third and Fourth arguments must be numbers")
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

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const elementId = parsedVideostrate.addCustomElement(
      name.value,
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
