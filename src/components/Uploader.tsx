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
    <>
      <label htmlFor="clips-upload" className="btn btn-sm btn-accent w-full">
        <i className="bi bi-file-earmark-plus text-lg"></i> Import clips{" "}
      </label>
      <input
        type="file"
        id="clips-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default Uploader
