import { ExecutionContext } from "../executionContext"
import { WorkingContext } from "../workingContext"

export const unprocessAddClipCommand = (
  _: string[],
  context: ExecutionContext,
  workingContext: WorkingContext,
  returnVariableName?: string
) => {
  const parsedVideostrate = workingContext.getVideostrate()

  const variable = context[returnVariableName ?? ""]
  if (!variable) {
    throw new Error(`Variable "${returnVariableName}" not found in context`)
  }
  if (variable.type !== "string") {
    throw new Error(`Variable "${returnVariableName}" must be a string`)
  }
  parsedVideostrate.deleteElementById(variable.value)

  workingContext.setVideostrate(parsedVideostrate)
}
