import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processDeleteAnimationCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValueTyped<string>("string", args[0], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.removeAnimation(name.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_animation command: ",
      error
    )
  }
}
