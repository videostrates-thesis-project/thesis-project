import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"
import { ReturnValue } from "../returnValue"

export const processAssignClassCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementIds = determineReturnValue(args[0], context)
  if (elementIds.type !== "array") {
    throw new Error("First argument must be an array")
  }

  const className = determineReturnValue(args[1], context)
  if (className.type !== "string") {
    throw new Error("Second argument must be a string")
  }

  const parsedVideostrate = useStore.getState().parsedVideostrate
  const elements = (elementIds.value as ReturnValue[]).map((value) => {
    if (value.type !== "string") {
      throw new Error("Array elements must be strings")
    }
    return value.value as string
  })

  try {
    const elementId = parsedVideostrate.assignClass(elements, className.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: elementId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_custom_element command: ",
      error
    )
  }
}
