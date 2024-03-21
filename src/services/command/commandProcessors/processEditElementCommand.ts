import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processEditElementCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const id = determineReturnValueTyped<string>("string", args[0], context)
  const content = determineReturnValueTyped<string>("string", args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    const elementId = parsedVideostrate.updateCustomElement(
      id.value,
      content.value
    )
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: elementId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing edit_custom_element command: ",
      error
    )
    throw error
  }
}
