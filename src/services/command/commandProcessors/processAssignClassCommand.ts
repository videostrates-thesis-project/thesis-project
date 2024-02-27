import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"
import { ReturnValue } from "../returnValue"

export const processAssignClassCommand = (
  args: string[],
  context: ExecutionContext
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

  const parsedVideostrate = useStore.getState().parsedVideostrate
  const elements = (elementIds.value as ReturnValue[]).map((value) => {
    if (value.type !== "string") {
      throw new Error("Array elements must be strings")
    }
    return value.value as string
  })

  try {
    parsedVideostrate.assignClass(elements, className.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing assign_class command: ",
      error
    )
  }
}
