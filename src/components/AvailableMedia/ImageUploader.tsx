import React, { useCallback } from "react"
import { uploadImage } from "../../services/upload"
import { useStore } from "../../store"

const ImageUploader = () => {
  const { availableImages, setAvailableImages } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target?.files || []
      const uploadImagePromises = Array.from(files).map(async (file) => ({
        url: await uploadImage(file),
        title: file.name.split(".").slice(0, -1).join("."),
      }))
      const images = (await Promise.all(uploadImagePromises)).filter(
        (image) => image.url !== undefined
      ) as { url: string; title: string }[]
      console.log(images)
      setAvailableImages([...availableImages, ...images])
      // Clear input so that the same file can be uploaded again
      e.target.value = ""
    },
    [availableImages, setAvailableImages]
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
