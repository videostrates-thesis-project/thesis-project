import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { WorkingContext } from "../workingContext"

export const processRenameElement = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
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

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.renameElement(elementId.value, newName.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing rename_element command: ",
      error
    )
  }
}
