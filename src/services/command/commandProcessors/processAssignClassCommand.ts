import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { ReturnValue } from "../returnValue"
import { WorkingContext } from "../workingContext"

export const processAssignClassCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementIds = determineReturnValueTyped<ReturnValue<string>[]>(
    "array",
    args[0],
    context
  )

  const className = determineReturnValueTyped<string>(
    "string",
    args[1],
    context
  )

  const parsedVideostrate = workingContext.getVideostrate()
  const elements = (elementIds.value as ReturnValue[]).map((value) => {
    if (value.type !== "string") {
      throw new Error("Array elements must be strings")
    }
    return value.value as string
  })

  try {
    parsedVideostrate.assignClass(elements, className.value)
    workingContext.setVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing assign_class command: ",
      error
    )
  }
}
