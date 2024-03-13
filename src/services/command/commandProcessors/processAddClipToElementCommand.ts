import { useStore } from "../../../store"
import { determineReturnValueTyped } from "../determineReturnValue"
import { ExecutionContext } from "../executionContext"

export const processAddClipToElementCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 4) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValueTyped<string>(
    "string",
    args[0],
    context
  )
  const clipName = determineReturnValueTyped<string>("string", args[1], context)
  const start = determineReturnValueTyped<number>("number", args[2], context)
  const end = determineReturnValueTyped<number>("number", args[3], context)

  const availableClips = useStore.getState().availableClips
  const availableClip = availableClips.find(
    (clip) => clip.title === clipName.value
  )
  if (!availableClip) {
    throw new Error(
      `Clip with source "${clipName.value}" not found in available clips`
    )
  }

  const parsedVideostrate = useStore.getState().parsedVideostrate

  try {
    const clipId = parsedVideostrate.addClipToElement(
      elementId.value,
      availableClip.source,
      start.value,
      end.value
    )
    useStore.getState().setParsedVideostrate(parsedVideostrate)

    return {
      type: "string" as const,
      value: clipId,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing add_clip_to_element command: ",
      error
    )
  }
}
