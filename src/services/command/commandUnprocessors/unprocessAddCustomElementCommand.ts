import { ExecutionContext } from "../executionContext"
import { WorkingContext } from "../workingContext"

export const unprocessAddCustomElementCommand = (
  args: string[],
  context: ExecutionContext,
  workingContext: WorkingContext,
  returnVariableName?: string
) => {
  const parsedVideostrate = workingContext.getVideostrate()

  const variable = context[returnVariableName ?? ""]
  if (!variable) {
    throw new Error(`Variable "${args[0]}" not found in context`)
  }
  if (variable.type !== "string") {
    throw new Error(`Variable "${args[0]}" must be a string`)
  }
  parsedVideostrate.deleteElementById(variable.value)

  workingContext.setVideostrate(parsedVideostrate)
}
