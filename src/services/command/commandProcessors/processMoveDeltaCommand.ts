import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"
import { workingContext } from "../workingContext"

export const processMoveDeltaCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  const delta = determineReturnValue(args[1], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.moveClipDeltaById(elementId.value, delta.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}
