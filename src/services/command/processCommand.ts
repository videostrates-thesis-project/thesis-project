import { ExecutionContext } from "./executionContext"
import { tokenizeCommand } from "./tokenizeCommand"
import { ExecutableCommand, RecognizedCommands } from "./recognizedCommands"

export const parseAndExecuteCommand = async (
  command: string,
  recognizedCommands: RecognizedCommands,
  context: ExecutionContext = {}
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

  await executeCommand(executableCommand, recognizedCommands, context)
}

export const executeCommand = async (
  command: ExecutableCommand,
  recognizedCommands: RecognizedCommands,
  context: ExecutionContext
) => {
  const commandProperties = recognizedCommands[command.command]
  const result = await commandProperties.processFn(command.args, context)

  if (command.variable) {
    context[command.variable] = result
  }
}
