import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processCropElementCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)
  if (elementId.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const start = determineReturnValue(args[1], context)
  const end = determineReturnValue(args[2], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const newLength = parsedVideostrate.cropElementById(
      elementId.value,
      start.value,
      end.value
    )
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "number" as const,
      value: newLength,
    }
  } catch (error) {
    console.error("[CommandProcessor] Error processing crop command: ", error)
    throw error
  }
}
