import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processMoveCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  const startString = args[1]

  const start = parseInt(startString)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    parsedVideostrate.moveClipById(elementId.value, start)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}
