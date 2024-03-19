import React, { useCallback } from "react"
import { uploadImage } from "../services/upload"
import { useStore } from "../store"

const ImageUploader = () => {
  const { availableImages, setAvailableImages } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (!file) return
      const url = await uploadImage(file)
      if (!url) return // TODO: Show error
      const newImage = { url, title: "New image" }
      setAvailableImages([...availableImages, newImage])
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
        id="images-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default ImageUploader
