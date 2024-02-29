import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processCreateStyleCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
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

  const parsedVideostrate = workingContext.getVideostrate()
  try {
    const elementId = parsedVideostrate.addStyle(selector.value, style.value)
    workingContext.setVideostrate(parsedVideostrate)

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
