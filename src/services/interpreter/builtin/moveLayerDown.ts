import { useStore } from "../../../store"

export const moveLayerDown = (elementId: string) => {
  if (typeof elementId !== "string") {
    throw new Error("[move_layer_down] Element ID must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate
    try {
      parsedVideostrate.moveLayerDown(elementId)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing moveLayerDown command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `move_layer_down("${elementId}")`
  return returnFn
}
