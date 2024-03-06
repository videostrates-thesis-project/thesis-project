import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processDeleteAnimationCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValueTyped<string>("string", args[0], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.removeAnimation(name.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_animation command: ",
      error
    )
  }
}
