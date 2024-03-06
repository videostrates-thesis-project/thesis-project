import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { ExecutionContext } from "./executionContext"
import { ExecutableCommand } from "./recognizedCommands"

export interface ExecutedScript {
  script: ExecutableCommand[]
  context: ExecutionContext
  parsedVideostrate: ParsedVideostrate
}
