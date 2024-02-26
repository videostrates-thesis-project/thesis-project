import { processAddClipCommand } from "./commandProcessors/processAddClipCommand"
import { processAddCustomElementCommand } from "./commandProcessors/processAddCustomElementCommand"
import { processAssignClassCommand } from "./commandProcessors/processAssignClassCommand"
import { processCreateStyleCommand } from "./commandProcessors/processCreateStyleCommand"
import { processCropElementCommand } from "./commandProcessors/processCropElementCommand"
import { processDeleteElementCommand } from "./commandProcessors/processDeleteElementCommand"
import { processDeleteStyleCommand } from "./commandProcessors/processDeleteStyleCommand"
import { processMoveCommand } from "./commandProcessors/processMoveCommand"
import { processMoveDeltaCommand } from "./commandProcessors/processMoveDeltaCommand"
import { ExecutionContext } from "./executionContext"
import { processCommand } from "./processCommand"
import { RecognizedCommands } from "./recognizedCommands"

const recognizedCommands: RecognizedCommands = {
  move: {
    processFn: processMoveCommand,
  },
  add_clip: {
    processFn: processAddClipCommand,
  },
  delete_element: {
    processFn: processDeleteElementCommand,
  },
  crop: {
    processFn: processCropElementCommand,
  },
  move_delta: {
    processFn: processMoveDeltaCommand,
  },
  add_custom_element: {
    processFn: processAddCustomElementCommand,
  },
  create_style: {
    processFn: processCreateStyleCommand,
  },
  delete_style: {
    processFn: processDeleteStyleCommand,
  },
  assign_class: {
    processFn: processAssignClassCommand,
  },
}

export const executeScript = async (script: string) => {
  const lines = script.split("\n")
  const context: ExecutionContext = {}
  lines.forEach((line) => processCommand(line, recognizedCommands, context))
}
