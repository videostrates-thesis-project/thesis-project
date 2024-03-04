import { useStore } from "../../store"
import { processAddClipCommand } from "./commandProcessors/processAddClipCommand"
import { processAddCustomElementCommand } from "./commandProcessors/processAddCustomElementCommand"
import { processAssignClassCommand } from "./commandProcessors/processAssignClassCommand"
import { processCreateAnimationCommand } from "./commandProcessors/processCreateAnimationCommand"
import { processCreateStyleCommand } from "./commandProcessors/processCreateStyleCommand"
import { processCropElementCommand } from "./commandProcessors/processCropElementCommand"
import { processDeleteAnimationCommand } from "./commandProcessors/processDeleteAnimation"
import { processDeleteElementCommand } from "./commandProcessors/processDeleteElementCommand"
import { processDeleteStyleCommand } from "./commandProcessors/processDeleteStyleCommand"
import { processMoveCommand } from "./commandProcessors/processMoveCommand"
import { processMoveDeltaCommand } from "./commandProcessors/processMoveDeltaCommand"
import { processSetSpeedCommand } from "./commandProcessors/processSetSpeedCommand"
import { ExecutedScript } from "./executedScript"
import { ExecutionContext } from "./executionContext"
import { processCommand } from "./processCommand"
import { RecognizedCommands } from "./recognizedCommands"
import {
  WorkingContextType,
  resolveWorkingContext,
} from "./resolveWorkingContext"

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
  create_animation: {
    processFn: processCreateAnimationCommand,
  },
  delete_animation: {
    processFn: processDeleteAnimationCommand,
  },
  set_speed: {
    processFn: processSetSpeedCommand,
  },
}

export const executeScript = async (
  script: string,
  contextType: WorkingContextType = "main"
) => {
  console.log("Executing script: \n", script)
  const lines = script.split("\n")
  const context: ExecutionContext = {}
  const workingContext = resolveWorkingContext(contextType)
  const videoStrateBefore = workingContext.getVideostrate().clone()
  lines.forEach((line) =>
    processCommand(line, recognizedCommands, context, workingContext)
  )

  const executedScript: ExecutedScript = {
    script,
    contextType,
    context,
    parsedVideostrate: videoStrateBefore,
  }
  useStore.getState().addToUndoStack(executedScript)
}
