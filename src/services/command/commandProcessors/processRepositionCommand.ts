import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processRepositionCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  const start = parseInt(args[1])
  const end = parseInt(args[2])

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.repositionClipById(elementId.value, start, end)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
    throw error
  }
}
