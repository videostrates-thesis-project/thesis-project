import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processAddSubtitleCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const text = determineReturnValue(args[0], context)
  if (text.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const start = determineReturnValue(args[1], context)
  const end = determineReturnValue(args[2], context)
  if (start.type !== "number" || end.type !== "number") {
    throw new Error("Third and Fourth arguments must be numbers")
  }

  const parser = new DOMParser()
  const document = parser.parseFromString(
    `<div class="composited subtitles">
    <span class="composited subtitle">${text.value}</span></div>`,
    "text/html"
  )
  const htmlElement = document.body.firstChild as HTMLElement

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    const elementId = parsedVideostrate.addCustomElement(
      "Subtitle",
      htmlElement.outerHTML,
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
