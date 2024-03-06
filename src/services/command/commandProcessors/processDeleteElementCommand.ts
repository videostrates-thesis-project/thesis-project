import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processDeleteElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    parsedVideostrate.deleteElementById(elementId.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_element command: ",
      error
    )
  }
}
