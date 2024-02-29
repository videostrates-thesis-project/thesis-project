import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processSetSpeedCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const clipId = determineReturnValueTyped<string>("string", args[0], context)
  const speed = determineReturnValueTyped<number>("number", args[1], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.setSpeed(clipId.value, speed.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_animation command: ",
      error
    )
  }
}
