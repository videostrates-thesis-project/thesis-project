import { useStore } from "../../../store"

export const addClip = (clipName: string, start: number, end?: number) => {
  if (typeof clipName !== "string") {
    throw new Error("[add_clip] Clip name must be a string")
  }
  if (typeof start !== "number") {
    throw new Error("[add_clip] Start time must be a number")
  }

  const returnFn = () => {
    const availableClips = useStore.getState().availableClips
    const availableClip = availableClips.find((clip) => clip.title === clipName)
    if (!availableClip) {
      throw new Error(
        `[add_clip] Clip with source "${clipName}" not found in available clips`
      )
    }
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      const clipId = parsedVideostrate.addClip(
        availableClip,
        start,
        end ?? start + 10
      )
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      return clipId
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing add_clip command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `add_clip("${clipName}", ${start}, ${end})`
  return returnFn
}
