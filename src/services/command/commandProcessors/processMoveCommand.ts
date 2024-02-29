import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"
import { WorkingContext } from "../workingContext"

export const processMoveCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  const startString = args[1]

  const start = parseInt(startString)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.moveClipById(elementId.value, start)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}
