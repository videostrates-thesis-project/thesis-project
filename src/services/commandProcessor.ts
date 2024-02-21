import { useStore } from "../store"

const determineValue = (
  value: string,
  context: ExecutionContext
): ReturnValue => {
  // if value starts and ends with apostrophes, it's a constant string
  if (value.startsWith('"') && value.endsWith('"')) {
    return {
      type: "string" as const,
      value: value.slice(1, -1),
    }
  }

  // if value starts with a letter, it's a variable
  if (value.match(/[a-zA-Z]/)) {
    // If context doesn't have the variable as a key
    if (!context[value]) {
      throw new Error(`Variable "${value}" not found in context`)
    }
    return context[value]
  }

  // if value is a number (int, float etc), it's a constant number
  const float = parseFloat(value)
  if (!isNaN(float)) {
    return {
      type: "number" as const,
      value: float,
    }
  }

  throw new Error(`Value "${value}" not recognized`)
}

const processCropElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineValue(args[0], context)
  if (elementId.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const start = determineValue(args[1], context)
  const end = determineValue(args[2], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const newLength = parsedVideostrate.cropElementById(
      elementId.value,
      start.value,
      end.value
    )
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "number" as const,
      value: newLength,
    }
  } catch (error) {
    console.error("[CommandProcessor] Error processing crop command: ", error)
  }
}

const processMoveCommand = (args: string[], context: ExecutionContext) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineValue(args[0], context)
  const startString = args[1]

  const start = parseInt(startString)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.moveClipById(elementId.value, start)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}

const processMoveDeltaCommand = (args: string[], context: ExecutionContext) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineValue(args[0], context)
  const delta = determineValue(args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.moveClipDeltaById(elementId.value, delta.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}

const processAddClipCommand = (args: string[], context: ExecutionContext) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const clipName = determineValue(args[0], context)
  if (clipName.type !== "string") {
    throw new Error("First argument must be a string")
  }
  const availableClips = useStore.getState().availableClips
  const availableClip = availableClips.find(
    (clip) => clip.title === clipName.value
  )
  if (!availableClip) {
    throw new Error(
      `Clip with source "${clipName.value}" not found in available clips`
    )
  }

  const startString = args[1]

  const start = parseInt(startString)
  const end = start + 25

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const clipId = parsedVideostrate.addClip(availableClip.source, start, end)
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: clipId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_clip command: ",
      error
    )
  }
}

const processDeleteElementCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineValue(args[0], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.deleteElementById(elementId.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_element command: ",
      error
    )
  }
}

interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext
  ) => ReturnValue | undefined | void
}

type CommandType =
  | "move"
  | "add_clip"
  | "delete_element"
  | "crop"
  | "move_delta"

const recognizedCommands: { [key: string]: CommandProperties } = {
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
}

type ReturnValue = {
  type: "string" | "number"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

type ExecutionContext = {
  [key: string]: ReturnValue
}

export const processScript = (script: string) => {
  const lines = script.split("\n")
  const context: ExecutionContext = {}
  lines.forEach((line) => processCommand(line, context))
}

export const processCommand = (
  command: string,
  context: ExecutionContext = {}
) => {
  if (!command || command.includes("```")) return
  console.log("Processing command", command)

  const { command: commandType, args, variable } = tokenize(command)
  const returnValue = recognizedCommands[commandType].processFn(args, context)
  console.log("Context", returnValue, context)
  if (returnValue) {
    if (variable) {
      context[variable] = returnValue
      console.log("Setting variable", variable, "as", returnValue)
    }
  }
}

const tokenize = (input: string) => {
  const assignmentParts = input.split("=")
  let variable: string | null = null
  if (assignmentParts.length === 2) {
    variable = assignmentParts[0].trim()
    input = input.slice(assignmentParts[0].length + 1)
    input = input.trimStart()
  }

  const parts = input.split("(")
  const command = parts[0] as CommandType

  if (!command || !recognizedCommands[command]) {
    throw new Error(`Command "${command}" not recognized`)
  }
  const args = parts[1]
    .split(")")[0]
    .split(",")
    .map((arg) => arg.trim())

  return { command, args, variable }
}
