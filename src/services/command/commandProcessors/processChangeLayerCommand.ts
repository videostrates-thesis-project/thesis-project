import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { useStore } from "../../../store"

export const processChangeLayerCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 2) {
    throw new Error("Invalid number of arguments")
  }
  const elementId = determineReturnValueTyped<string>(
    "string",
    args[0],
    context
  )
  const layer = determineReturnValueTyped<number>("number", args[1], context)

  const parsedVideostrate = useStore.getState().parsedVideostrate.clone()

  try {
    parsedVideostrate.changeLayer(elementId.value, layer.value)
    useStore.getState().setParsedVideostrate(parsedVideostrate)
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing change_layer command: ",
      error
    )
    throw error
  }
}
