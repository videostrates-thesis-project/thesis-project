import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processDeleteStyleCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const selector = determineReturnValue(args[0], context)
  if (selector.type !== "string") {
    throw new Error("First argument must be a string")
  }

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    const elementId = parsedVideostrate.removeStyle(selector.value)
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
