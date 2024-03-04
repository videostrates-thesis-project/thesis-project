import { ExecutionContext } from "./executionContext"
import { tokenizeCommand } from "./tokenizeCommand"
import { WorkingContext } from "./workingContext"
import { ExecutableCommand, RecognizedCommands } from "./recognizedCommands"

export const parseAndExecuteCommand = (
  command: string,
  recognizedCommands: RecognizedCommands,
  context: ExecutionContext = {},
  workingContext: WorkingContext
) => {
  if (!command || command.includes("```")) return

  if (command.startsWith("//")) {
    console.error(
      "ChatGPT responded with a comment instead of valid commands:",
      command.slice(2)
    )
    return
  }

  const executableCommand = tokenizeCommand(command)

  executeCommand(executableCommand, recognizedCommands, context, workingContext)
}

export const executeCommand = (
  command: ExecutableCommand,
  recognizedCommands: RecognizedCommands,
  context: ExecutionContext,
  workingContext: WorkingContext
) => {
  const commandProperties = recognizedCommands[command.command]
  const result = commandProperties.processFn(
    command.args,
    context,
    workingContext
  )

  if (command.variable) {
    context[command.variable] = result
  }
}
