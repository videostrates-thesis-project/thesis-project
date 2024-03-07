import { useStore } from "../../store"
import { processAddClipCommand } from "./commandProcessors/processAddClipCommand"
import { processAddCustomElementCommand } from "./commandProcessors/processAddCustomElementCommand"
import { processAddSubtitleCommand } from "./commandProcessors/processAddSubtitleCommand"
import { processAssignClassCommand } from "./commandProcessors/processAssignClassCommand"
import { processCreateAnimationCommand } from "./commandProcessors/processCreateAnimationCommand"
import { processCreateStyleCommand } from "./commandProcessors/processCreateStyleCommand"
import { processCropElementCommand } from "./commandProcessors/processCropElementCommand"
import { processDeleteAnimationCommand } from "./commandProcessors/processDeleteAnimation"
import { processDeleteElementCommand } from "./commandProcessors/processDeleteElementCommand"
import { processDeleteStyleCommand } from "./commandProcessors/processDeleteStyleCommand"
import { processMoveCommand } from "./commandProcessors/processMoveCommand"
import { processMoveDeltaCommand } from "./commandProcessors/processMoveDeltaCommand"
import { processRenameElement } from "./commandProcessors/processRenameElementCommand"
import { processSetSpeedCommand } from "./commandProcessors/processSetSpeedCommand"
import { ExecutedScript } from "./executedScript"
import { ExecutionContext } from "./executionContext"
import { executeCommand } from "./processCommand"
import { ExecutableCommand, RecognizedCommands } from "./recognizedCommands"
import { tokenizeCommand } from "./tokenizeCommand"

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
  add_subtitle: {
    processFn: processAddSubtitleCommand,
  },
  rename_element: {
    processFn: processRenameElement,
  },
  add_clip_to_element: {
    processFn: processAddClipCommand,
  },
}

export const parseAndExecuteScript = async (script: string) => {
  console.log("Executing script: \n", script)
  const lines = script.split("\n")
  const parsed = lines.map((line) => tokenizeCommand(line))

  executeScript(parsed)
}

export const executeScript = async (script: ExecutableCommand[]) => {
  const context: ExecutionContext = {}
  const videoStrateBefore = useStore.getState().parsedVideostrate.clone()
  script.forEach((line) => executeCommand(line, recognizedCommands, context))

  const executedScript: ExecutedScript = {
    script,
    context,
    parsedVideostrate: videoStrateBefore,
  }
  useStore.getState().addToUndoStack(executedScript)
}
