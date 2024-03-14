import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { azureImageRequest } from "../../api/api"

export const processGenerateImageCommand = async (
  args: string[],
  context: ExecutionContext
) => {
  if (args.length !== 1) {
    throw new Error("Invalid number of arguments")
  }
  const prompt = determineReturnValueTyped<string>("string", args[0], context)

  try {
    const { url } = await azureImageRequest({ prompt: prompt.value })

    return {
      type: "string" as const,
      value: url,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing generate_image command: ",
      error
    )
    throw error
  }
}
