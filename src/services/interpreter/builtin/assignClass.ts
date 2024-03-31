import { useStore } from "../../../store"

export const assignClass = (elementIds: string[], className: string) => {
  if (
    !Array.isArray(elementIds) ||
    elementIds.some((elementId) => typeof elementId !== "string")
  ) {
    throw new Error("[assign_class] elementIds must be a string array")
  }
  if (typeof className !== "string") {
    throw new Error("[assign_class] className must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate

    try {
      parsedVideostrate.assignClass(elementIds, className)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing assign_class command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () =>
    `assign_class(${JSON.stringify(elementIds)}, "${className}")`
  return returnFn
}
