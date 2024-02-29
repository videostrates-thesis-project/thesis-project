import { WorkingContextType } from "./executeScript"
import { ExecutionContext } from "./executionContext"

export interface ExecutedScript {
  script: string
  contextType: WorkingContextType
  context: ExecutionContext
}
