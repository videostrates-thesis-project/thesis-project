import { ExecutionContext } from "./executionContext"
import { tokenizeCommand } from "./tokenizeCommand"
import { ReturnValue } from "./returnValue"

interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext
  ) => ReturnValue | undefined | void
}

export const processCommand = (
  command: string,
  recognizedCommands: { [key: string]: CommandProperties },
  context: ExecutionContext = {}
) => {
  if (!command || command.includes("```")) return

  const { command: commandType, args, variable } = tokenizeCommand(command)
  if (!commandType || !recognizedCommands[commandType]) {
    throw new Error(`Command "${command}" not recognized`)
  }

  const commandProperties = recognizedCommands[commandType]
  const result = commandProperties.processFn(args, context)

  if (variable) {
    context[variable] = result
  }
}
