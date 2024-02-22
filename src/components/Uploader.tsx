import React, { useCallback } from "react"
import { uploadVideo } from "../services/upload"
import { useStore } from "../store"

const Uploader = () => {
  const { clipsSources, setClipsSources } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (!file) return
      const url = await uploadVideo(file)
      if (!url) return // TODO: Show error
      setClipsSources([...clipsSources, url])
    },
    [clipsSources, setClipsSources]
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
