import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processCreateAnimationCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValueTyped<string>("string", args[0], context)

  const body = determineReturnValueTyped<string>("string", args[1], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.addAnimation(name.value, body.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing create_animatino command: ",
      error
    )
  }
}
