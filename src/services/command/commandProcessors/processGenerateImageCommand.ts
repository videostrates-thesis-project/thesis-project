import { ExecutionContext } from "../executionContext"
import { determineReturnValueTyped } from "../determineReturnValue"
import { azureImageRequest } from "../../api/api"
import { useStore } from "../../../store"
import { uploadVideo } from "../../upload"

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
    // Download the image and upload it to Firebase
    const response = await fetch(url)
    const blob = await response.blob()
    const uploadedUrl = await uploadVideo(blob)
    if (!uploadedUrl) {
      throw new Error("Failed to upload image")
    }
    useStore
      .getState()
      .setAvailableImages([...useStore.getState().availableImages, uploadedUrl])

    return {
      type: "string" as const,
      value: uploadedUrl,
    }
  } catch (error) {
    console.error(
      "[CommandProcessor] Error processing generate_image command: ",
      error
    )
    throw error
  }
}
