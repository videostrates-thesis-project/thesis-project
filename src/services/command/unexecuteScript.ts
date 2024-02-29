import { unprocessAddClipCommand } from "./commandUnprocessors/unprocessAddClipCommand"
import { unprocessAddCustomElementCommand } from "./commandUnprocessors/unprocessAddCustomElementCommand"
import { ExecutedScript } from "./executedScript"
import { ExecutionContext } from "./executionContext"
import { RecognizedCommands } from "./recognizedCommands"
import { resolveWorkingContext } from "./resolveWorkingContext"
import { tokenizeCommand } from "./tokenizeCommand"
import { WorkingContext } from "./workingContext"

const recognizedCommands: RecognizedCommands = {
  move: {
    processFn: unprocessAddClipCommand,
  },
  add_clip: {
    processFn: unprocessAddClipCommand,
  },
  delete_element: {
    processFn: unprocessAddClipCommand,
  },
  crop: {
    processFn: unprocessAddClipCommand,
  },
  move_delta: {
    processFn: unprocessAddClipCommand,
  },
  add_custom_element: {
    processFn: unprocessAddCustomElementCommand,
  },
  create_style: {
    processFn: unprocessAddClipCommand,
  },
  delete_style: {
    processFn: unprocessAddClipCommand,
  },
  assign_class: {
    processFn: unprocessAddClipCommand,
  },
  create_animation: {
    processFn: unprocessAddClipCommand,
  },
  delete_animation: {
    processFn: unprocessAddClipCommand,
  },
  set_speed: {
    processFn: unprocessAddClipCommand,
  },
}

export const unexecuteScript = (executedScript: ExecutedScript) => {
  const lines = executedScript.script.split("\n")

  const workingContext = resolveWorkingContext(executedScript.contextType)
  const context: ExecutionContext = {}

  lines.forEach((l) => processUnexecuteCommand(l, context, workingContext))
}

const processUnexecuteCommand = (
  command: string,
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  if (!command || command.includes("```") || command.startsWith("//")) return

  const { command: commandType, args, variable } = tokenizeCommand(command)
  if (!commandType || !recognizedCommands[commandType]) {
    throw new Error(`Command "${command}" not recognized`)
  }

  const commandProperties = recognizedCommands[commandType]
  const result = commandProperties.processFn(args, context, workingContext)

  if (variable) {
    context[variable] = result
  }
}
