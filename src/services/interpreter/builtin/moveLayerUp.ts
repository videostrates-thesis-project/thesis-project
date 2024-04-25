import { useStore } from "../../../store"

export const moveLayerUp = (elementId: string) => {
  if (typeof elementId !== "string") {
    throw new Error("[move_layer_up] Element ID must be a string")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate
    try {
      parsedVideostrate.moveLayerUp(elementId)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing moveLayerUp command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `move_layer_up("${elementId}")`
  return returnFn
}
