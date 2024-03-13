import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processAddSubtitleCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const text = determineReturnValueTyped<string>("string", args[0], context)
  const start = determineReturnValueTyped<number>("number", args[1], context)
  const end = determineReturnValueTyped<number>("number", args[2], context)

  const parser = new DOMParser()
  const document = parser.parseFromString(
    `<div class="composited subtitles">
    <span class="composited subtitle">${text.value}</span></div>`,
    "text/html"
  )
  const htmlElement = document.body.firstChild as HTMLElement

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const elementId = parsedVideostrate.addCustomElement(
      "Subtitle",
      htmlElement.outerHTML,
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
      "[CommandProcessor] Error processing add_subtitle command: ",
      error
    )
  }
}
