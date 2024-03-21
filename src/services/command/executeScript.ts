import { useStore } from "../../store"
import { processAddClipCommand } from "./commandProcessors/processAddClipCommand"
import { processAddClipToElementCommand } from "./commandProcessors/processAddClipToElementCommand"
import { processAddCustomElementCommand } from "./commandProcessors/processAddCustomElementCommand"
import { processAddSubtitleCommand } from "./commandProcessors/processAddSubtitleCommand"
import { processAssignClassCommand } from "./commandProcessors/processAssignClassCommand"
import { processChangeLayerCommand } from "./commandProcessors/processChangeLayerCommand"
import { processCreateAnimationCommand } from "./commandProcessors/processCreateAnimationCommand"
import { processCreateStyleCommand } from "./commandProcessors/processCreateStyleCommand"
import { processCropElementCommand } from "./commandProcessors/processCropElementCommand"
import { processDeleteAnimationCommand } from "./commandProcessors/processDeleteAnimation"
import { processDeleteElementCommand } from "./commandProcessors/processDeleteElementCommand"
import { processDeleteStyleCommand } from "./commandProcessors/processDeleteStyleCommand"
import { processEditElementCommand } from "./commandProcessors/processEditElementCommand"
import { processGenerateImageCommand } from "./commandProcessors/processGenerateImageCommand"
import { processRepositionCommand } from "./commandProcessors/processRepositionCommand"
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
  reposition: {
    processFn: processRepositionCommand,
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
    processFn: processAddClipToElementCommand,
  },
  move_layer: {
    processFn: processChangeLayerCommand,
  },
  generate_image: {
    processFn: processGenerateImageCommand,
  },
  edit_custom_element: {
    processFn: processEditElementCommand,
  },
}

export const parseAndExecuteScript = async (script: string) => {
  console.log("Executing script: \n", script)
  const lines = script.trim().split("\n")
  const parsed = lines.map((line) => tokenizeCommand(line))

  return await executeScript(parsed)
}

export const executeScript = async (script: ExecutableCommand[]) => {
  console.log("Executing script\n", script)
  const context: ExecutionContext = {}
  const videoStrateBefore = useStore.getState().parsedVideostrate.clone()

  for (const line of script) {
    try {
      await executeCommand(line, recognizedCommands, context)
    } catch (error) {
      console.error("Error processing script:\n", script)
      console.error("Line:\n", line)
      console.error(error)
      useStore
        .getState()
        .addToast("error", "Error processing script", (error as Error).message)
      useStore.getState().setParsedVideostrate(videoStrateBefore)
      return
    }
  }
  const executedScript: ExecutedScript = {
    script,
    context,
    parsedVideostrate: videoStrateBefore,
  }
  useStore.getState().addToUndoStack(executedScript)
  return {
    asPendingChanges: () => useStore.getState().setPendingChanges(true),
  }
}
