import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processDeleteStyleCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const selector = determineReturnValue(args[0], context)
  if (selector.type !== "string") {
    throw new Error("First argument must be a string")
  }

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const elementId = parsedVideostrate.removeStyle(selector.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: elementId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_style command: ",
      error
    )
    throw error
  }
}
