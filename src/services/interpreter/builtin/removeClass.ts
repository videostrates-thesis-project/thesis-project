import { useStore } from "../../../store"

export const removeClass = (elementIds: string[], className: string) => {
  if (
    !Array.isArray(elementIds) ||
    elementIds.some((elementId) => typeof elementId !== "string")
  ) {
    throw new Error("[remove_class] elementIds must be a string array")
  }
  if (typeof className !== "string") {
    throw new Error("[remove_class] className must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.removeClass(elementIds, className)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing remove_class command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `assign_class(${JSON.stringify(elementIds)}, "${className}")`
  return returnFn
}
