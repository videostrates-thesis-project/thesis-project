import { mainContext, workingContext } from "./workingContext"

export type WorkingContextType = "main" | "temporary"

export const resolveWorkingContext = (contextType: WorkingContextType) => {
  if (contextType === "main") {
    return mainContext
  } else if (contextType === "temporary") {
    return workingContext
  }

  throw new Error(`Unknown context type: ${contextType}`)
}
