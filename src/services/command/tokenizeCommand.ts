import {
  AvailableCommand,
  ExecutableCommand,
  availableCommands,
} from "./recognizedCommands"

export const tokenizeCommand = (input: string): ExecutableCommand => {
  if (input.startsWith("var ") || input.startsWith("let ")) {
    input = input.slice(4)
  }

  if (input.startsWith("const ")) {
    input = input.slice(6)
  }

  const assignmentParts = input.split("=")
  let variable: string | null = null
  if (assignmentParts.length > 1 && input.indexOf("=") < input.indexOf("(")) {
    variable = assignmentParts[0].trim()
    input = input.slice(assignmentParts[0].length + 1)
    input = input.trimStart()
  }

  let argStart = input.indexOf("(")
  const command = input.slice(0, argStart).trim() as AvailableCommand
  if (!availableCommands.includes(command)) {
    throw new Error(`Command "${command}" not recognized`)
  }

  if (!argStart || input.indexOf(")") === -1)
    throw new Error(`No arguments provided for command "${command}"`)

  const args: string[] = []
  let quoteNum = 0
  let singleQuoteNum = 0
  let squareBracketsNum = 0
  for (let i = argStart + 1; i < input.length; i++) {
    if (input[i] === '"' && input[i - 1] !== "\\") {
      quoteNum++
    }
    if (input[i] === "'" && input[i - 1] !== "\\") {
      singleQuoteNum++
    }

    if (input[i] === "[" && input[i - 1] !== "\\") {
      squareBracketsNum++
    }

    if (input[i] === "]" && input[i - 1] !== "\\") {
      squareBracketsNum--
    }

    if (
      (input[i] === "," || input[i] === ")") &&
      quoteNum % 2 === 0 &&
      squareBracketsNum === 0 &&
      singleQuoteNum % 2 === 0
    ) {
      args.push(input.slice(argStart + 1, i).trim())
      quoteNum = 0
      argStart = i
    }
  }

  return { command, args, variable }
}
