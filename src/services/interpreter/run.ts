import { useStore } from "../../store"
import { ExecutedFunction, ExecutedScript } from "./executedScript"
import { parse } from "./parser"

export const runBase = async (
  runCallback: () => Promise<ExecutedFunction[]>,
  text: string
) => {
  const videoStrateBefore = useStore.getState().parsedVideostrate.clone()
  let functions: ExecutedFunction[]
  try {
    functions = await runCallback()
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing script, rolling back:",
      error
    )
    useStore
      .getState()
      .addToast("error", "Error processing script", (error as Error).message)
    useStore.getState().setParsedVideostrate(videoStrateBefore)
    return
  }

  const executedScript: ExecutedScript = {
    text,
    script: functions,
    parsedVideostrate: videoStrateBefore,
  }
  useStore.getState().addToUndoStack(executedScript)

  return {
    asPendingChanges: () => useStore.getState().setPendingChanges(true),
  }
}

export const runScript = async (script: string) => {
  console.log("Running script\n", script)
  return await runBase(async () => {
    return await parse(script)
  }, script)
}

export const runCommands = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...commands: (() => any)[]
) => {
  return await runBase(
    async () => {
      const functions: ExecutedFunction[] = []
      for (const command of commands) {
        await command()
        const parsed = parseStyleString(command.toString())
        if (parsed) {
          functions.push(parsed)
        }
      }
      return functions
    },
    commands.map((c) => c.toString()).join("\n")
  )
}

function parseStyleString(styleString: string): ExecutedFunction | null {
  // Regular expression to match the function name and arguments
  const regex = /(\w+)\(([^)]+)\)/
  const match = styleString.match(regex)

  if (!match) return null // Return null if the string does not match the expected pattern

  const name = match[1] // Function name
  const argsString = match[2] // Arguments as a string

  // Split arguments string into individual arguments
  const args = argsString.split(/,\s*/).map((arg) => {
    // Remove surrounding quotes from strings
    if (arg.startsWith("'") && arg.endsWith("'")) {
      return arg.slice(1, -1)
    } else if (arg.startsWith('"') && arg.endsWith('"')) {
      return arg.slice(1, -1)
    } else if (!isNaN(parseFloat(arg))) {
      // Parse numeric arguments
      return parseFloat(arg)
    }
    // Add more parsing logic here if needed (e.g., for arrays or objects)
    return arg
  })

  return { name, arguments: args }
}
