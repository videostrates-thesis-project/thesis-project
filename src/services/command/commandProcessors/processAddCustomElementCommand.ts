import { ExecutionContext } from "../executionContext"
import { determineReturnValue } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processAddCustomElementCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 4) {
    throw new Error("Invalid number of arguments")
  }
  const name = determineReturnValue(args[0], context)
  if (name.type !== "string") {
    throw new Error("First argument must be a string")
  }

  const content = determineReturnValue(args[1], context)
  if (content.type !== "string") {
    throw new Error("Second argument must be a string")
  }
  const start = determineReturnValue(args[2], context)
  const end = determineReturnValue(args[3], context)
  if (start.type !== "number" || end.type !== "number") {
    throw new Error("Third and Fourth arguments must be numbers")
  }

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const elementId = parsedVideostrate.addCustomElement(
      name.value,
      content.value,
      start.value,
      end.value
    )
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
    throw error
  }
}
