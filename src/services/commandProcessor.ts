import { useStore } from "../store"

const processCropElementCommand = (args: string[]) => {
  if (args.length !== 3) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = args[0]
  const startString = args[1]
  const endString = args[2]

  const start = parseInt(startString)
  const end = parseInt(endString)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.cropElementById(elementId, start, end)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing crop command: ", error)
  }
}

const processMoveCommand = (args: string[]) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = args[0]
  const startString = args[1]

  const start = parseInt(startString)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.moveClipById(elementId, start)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}

const processMoveDeltaCommand = (args: string[]) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = args[0]
  const deltaString = args[1]

  const delta = parseInt(deltaString)

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.moveClipDeltaById(elementId, delta)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error("[CommandProcessor] Error processing move command: ", error)
  }
}

const processAddClipCommand = (args: string[]) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const source = args[0]
  const startString = args[1]

  const start = parseInt(startString)
  const end = start + 25

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.addClip(source, start, end)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_clip command: ",
      error
    )
  }
}

const processDeleteElementCommand = (args: string[]) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = args[0]

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    parsedVideostrate.deleteElementById(elementId)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing delete_element command: ",
      error
    )
  }
}

interface CommandProperties {
  processFn: (args: string[]) => void
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

export const processCommand = (command: string) => {
  const { command: commandType, args } = tokenize(command)
  recognizedCommands[commandType].processFn(args)
}

const tokenize = (input: string) => {
  const parts = input.split("(")
  const command = parts[0] as CommandType

  if (!command || !recognizedCommands[command]) {
    throw new Error(`Command "${command}" not recognized`)
  }
  const args = parts[1]
    .split(")")[0]
    .split(",")
    .map((arg) => arg.trim())

  return { command, args }
}
