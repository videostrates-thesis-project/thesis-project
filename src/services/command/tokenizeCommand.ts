export const tokenizeCommand = (input: string) => {
  const assignmentParts = input.split("=")
  let variable: string | null = null
  if (assignmentParts.length === 2 && input.indexOf("=") < input.indexOf("(")) {
    variable = assignmentParts[0].trim()
    input = input.slice(assignmentParts[0].length + 1)
    input = input.trimStart()
  }

  let argStart = input.indexOf("(")
  const command = input.slice(0, argStart).trim()
  if (!argStart || input.indexOf(")") === -1)
    throw new Error(`No arguments provided for command "${command}"`)

  const args: string[] = []
  let quoteNum = 0
  for (let i = argStart + 1; i < input.length; i++) {
    if (input[i] === '"' && input[i - 1] !== "\\") {
      quoteNum++
    }

    if ((input[i] === "," || input[i] === ")") && quoteNum % 2 === 0) {
      args.push(input.slice(argStart + 1, i).trim())
      quoteNum = 0
      argStart = i
    }
  }

  return { command, args, variable }
}
