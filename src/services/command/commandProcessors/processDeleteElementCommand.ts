import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"
import { workingContext } from "../workingContext"

export const processDeleteElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValue(args[0], context)

  const parsedVideostrate = workingContext.getVideostrate()

  try {
    parsedVideostrate.deleteElementById(elementId.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_element command: ",
      error
    )
  }
}
