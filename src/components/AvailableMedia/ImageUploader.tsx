import React, { useCallback, useState } from "react"
import { uploadImage } from "../../services/upload"
import { useStore } from "../../store"
import removeExtension from "../../utils/removeExtension"
import { generateImage } from "../../services/interpreter/builtin/generateImage"
import { runCommands } from "../../services/interpreter/run"
import openAIService from "../../services/chatgpt/openai"

const ImageUploader = () => {
  const { addAvailableImage } = useStore()
  const [imagePrompt, setImagePrompt] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target?.files || []
      const uploadImagePromises = Array.from(files).map(async (file) => {
        const url = await uploadImage(file)
        if (url) addAvailableImage({ url, title: removeExtension(file.name) })
      })
      await Promise.all(uploadImagePromises)
      // Clear input so that the same file can be uploaded again
      e.target.value = ""
    },
    [addAvailableImage]
  )

  const onGenerateImage = useCallback(async () => {
    if (!imagePrompt) return
    setIsLoading(true)
    const prompt = imagePrompt
    setImagePrompt("")
    const title =
      (await openAIService.createImageTitle(prompt)) ?? prompt.slice(0, 15)
    await runCommands(generateImage(title, prompt))
    setIsLoading(false)
  }, [imagePrompt, setImagePrompt, setIsLoading])

  return (
    <>
      <label htmlFor="images-upload" className="btn btn-sm btn-accent w-full">
        <i className="bi bi-image text-lg"></i> Import images
      </label>
      <div className="flex flex-row join w-full">
        <input
          type="text"
          className="input input-sm join-item input-bordered w-full max-h-32 min-h-8 text-left min-w-0 leading-7"
          placeholder="Generate image..."
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGenerateImage()
          }}
        />
        <button
          className="btn btn-sm btn-accent join-item px-2 h-full min-w-0"
          onClick={onGenerateImage}
        >
          {isLoading ? (
            <i className="bi bi-arrow-clockwise animate-spin"></i>
          ) : (
            <i className="bi bi-arrow-right-short"></i>
          )}
        </button>
      </div>
      <input
        type="file"
        accept=".png"
        multiple
        id="images-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default ImageUploader
