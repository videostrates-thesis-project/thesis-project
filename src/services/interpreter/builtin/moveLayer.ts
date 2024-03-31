import { useStore } from "../../../store"

export const moveLayer = (elementId: string, layer: number) => {
  if (typeof elementId !== "string") {
    throw new Error("[move_layer] Element ID must be a string")
  }
  if (typeof layer !== "number") {
    throw new Error("[move_layer] Layer must be a number")
  }

  const returnFn = () => {
    const parsedVideostrate = useStore.getState().parsedVideostrate
    try {
      parsedVideostrate.changeLayer(elementId, layer)
      useStore.getState().setParsedVideostrate(parsedVideostrate)
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing change_layer command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `move_layer("${elementId}", ${layer})`
  return returnFn
}
