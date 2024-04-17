import { useStore } from "../../../store"

export const addCroppedClip = (
  clipName: string,
  position: number,
  relativeStart: number,
  relativeEnd: number
) => {
  if (typeof clipName !== "string") {
    throw new Error("[add_cropped_clip] Clip name must be a string")
  }
  if (typeof position !== "number") {
    throw new Error("[add_cropped_clip] Start time must be a number")
  }
  if (typeof relativeStart !== "number") {
    throw new Error("[add_cropped_clip] Start time must be a number")
  }
  if (typeof relativeEnd !== "number") {
    throw new Error("[add_cropped_clip] End time must be a number")
  }

  const returnFn = () => {
    const availableClips = useStore.getState().clipsMetadata
    const availableClip = availableClips.find((clip) => clip.title === clipName)
    if (!availableClip) {
      throw new Error(
        `[add_cropped_clip] Clip with source "${clipName}" not found in available clips`
      )
    }
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const clipMetadata = useStore
        .getState()
        .clipsMetadata.find((clip) => clip.title === clipName)
      const clipId = parsedVideostrate.addClip(
        availableClip,
        position,
        clipMetadata?.length ?? 100
      )
      parsedVideostrate.cropElementById(clipId, relativeStart, relativeEnd)
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return clipId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_cropped_clip command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `add_cropped_clip("${clipName}", ${position}, ${relativeStart}, ${relativeEnd})`
  return returnFn
}
