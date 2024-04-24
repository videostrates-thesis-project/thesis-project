import { useStore } from "../../../store"

export const addClipToElement = (
  elementId: string,
  clipName: string,
  start: number,
  end: number
) => {
  if (typeof elementId !== "string") {
    throw new Error("[add_clip_to_container] Element ID must be a string")
  }
  if (typeof clipName !== "string") {
    throw new Error("[add_clip_to_container] Clip name must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[add_clip_to_container] Start time must be a number")
  }
  if (typeof end !== "number") {
    throw new Error("[add_clip_to_container] End time must be a number")
  }

  const returnFn = () => {
    const availableClips = useStore.getState().clipsMetadata
    const availableClip = availableClips.find((clip) => clip.title === clipName)
    if (!availableClip) {
      throw new Error(
        `[add_clip_to_container] Clip with source "${clipName}" not found in available clips`
      )
    }

    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const clipId = parsedVideostrate.addClipToElement(
        elementId,
        availableClip,
        start,
        end
      )
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return clipId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_clip_to_container command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `add_clip_to_container("${elementId}", "${clipName}", ${start}, ${end})`
  return returnFn
}
