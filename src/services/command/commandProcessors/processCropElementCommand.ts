import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"
import { WorkingContext } from "../workingContext"

export const processCropElementCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  if (elementId.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const start = determineReturnValue(args[1], context)
  const end = determineReturnValue(args[2], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    const newLength = parsedVideostrate.cropElementById(
      elementId.value,
      start.value,
      end.value
    )
    workingContext.setVideostrate(parsedVideostrate)

    return {
      type: "number" as const,
      value: newLength,
    }
  } catch (error) {
    console.error("[CommandProcessor] Error processing crop command: ", error)
  }
}
