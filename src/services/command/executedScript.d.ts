import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { WorkingContextType } from "./executeScript"
import { ExecutionContext } from "./executionContext"
import { ExecutableCommand } from "./recognizedCommands"

export interface ExecutedScript {
  script: ExecutableCommand[]
  contextType: WorkingContextType
  context: ExecutionContext
  parsedVideostrate: ParsedVideostrate
}
