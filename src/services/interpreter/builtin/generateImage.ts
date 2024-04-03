import { azureImageRequest } from "../../api/api"
import { useStore } from "../../../store"
import { uploadVideo } from "../../upload"

export const generateImage = (imageName: string, prompt: string) => {
  if (typeof imageName !== "string") {
    throw new Error("[generate_image] Image name must be a string")
  }
  if (typeof prompt !== "string") {
    throw new Error("[generate_image] Prompt must be a string")
  }

  const returnFn = async () => {
    try {
      const { url } = await azureImageRequest({ prompt: prompt })
      // Download the image and upload it to Firebase
      const response = await fetch(url)
      const blob = await response.blob()
      const uploadedUrl = await uploadVideo(blob)
      if (!uploadedUrl) {
        throw new Error("Failed to upload image")
      }
      useStore
        .getState()
        .addAvailableImage({ url: uploadedUrl, title: imageName })

      return uploadedUrl
    } catch (error) {
      console.error(
        "[CommandProcessor] Error processing generate_image command: ",
        error
      )
      throw error
    }
  }

  returnFn.toString = () => `generate_image("${imageName}", "${prompt}")`
  return returnFn
}
