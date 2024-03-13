import { useStore } from "../../../store"
import { determineReturnValue } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processAddClipCommand = (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const clipName = determineReturnValue(args[0], context)
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

  const start = parseFloat(startString)
  // TODO: look up clip metadata and use that to determine the end time
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
