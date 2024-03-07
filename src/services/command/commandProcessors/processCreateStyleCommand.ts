import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processCreateStyleCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const selector = determineReturnValue(args[0], context)
  if (selector.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const style = determineReturnValue(args[1], context)
  if (style.type !== "string") {
    throw new Error("Second argument must be a string")
  }

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()
  try {
    const elementId = parsedVideostrate.addStyle(selector.value, style.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: elementId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_style command: ",
      error
    )
  }
}
