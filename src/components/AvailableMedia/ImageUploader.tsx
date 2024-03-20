import React, { useCallback } from "react"
import { uploadImage } from "../../services/upload"
import { useStore } from "../../store"
import removeExtension from "../../utils/removeExtension"

const ImageUploader = () => {
  const { addAvailableImage } = useStore()

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
  return (
    <>
      <label htmlFor="images-upload" className="btn btn-sm btn-accent w-full">
        <i className="bi bi-image text-lg"></i> Import images
      </label>
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
