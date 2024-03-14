import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processCreateAnimationCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValueTyped<string>("string", args[0], context)

  const body = determineReturnValueTyped<string>("string", args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    parsedVideostrate.addAnimation(name.value, body.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing create_animation command: ",
      error
    )
    throw error
  }
}
