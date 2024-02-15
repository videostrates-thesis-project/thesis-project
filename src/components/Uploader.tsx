import React, { useCallback } from "react"
import { uploadVideo } from "../services/upload"

const Uploader = () => {
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (!file) return
      const url = await uploadVideo(file)
      // TODO: Add to available clips / get metadata
    },
    []
  )
  return (
    <input
      type="file"
      className="file-input w-full max-w-xs"
      onChange={onUpload}
    />
  )
}

export default Uploader
