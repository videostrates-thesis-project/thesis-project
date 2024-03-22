import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processMoveDeltaEmbeddedCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  const delta = determineReturnValue(args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.moveClipWithEmbeddedDeltaById(elementId.value, delta.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing move_delta_embedded command: ",
      error
    )
    throw error
  }
}
