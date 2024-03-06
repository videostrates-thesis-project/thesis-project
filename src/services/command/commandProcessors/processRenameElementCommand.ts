import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processRenameElement = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValueTyped<string>(
    "string",
    args[0],
    context
  )
  const newName = determineReturnValueTyped<string>("string", args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    parsedVideostrate.renameElement(elementId.value, newName.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing rename_element command: ",
      error
    )
  }
}
