import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processSetSpeedCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const clipId = determineReturnValueTyped<string>("string", args[0], context)
  const speed = determineReturnValueTyped<number>("number", args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.setSpeed(clipId.value, speed.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_animation command: ",
      error
    )
  }
}
