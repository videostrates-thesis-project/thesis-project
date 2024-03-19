import React, { useCallback } from "react"
import { uploadVideo } from "../../services/upload"
import { useStore } from "../../store"

const ClipUploader = () => {
  const { addAvailableClip } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target?.files || []
      const uploadClipPromises = Array.from(files).map(async (file) => {
        const url = await uploadVideo(file)
        if (!url) return
        addAvailableClip(url, file.name)
        console.log("Uploaded clip", file.name, "to", url)
      })
      await Promise.all(uploadClipPromises)

      // Clear input so that the same file can be uploaded again
      e.target.value = ""
    },
    [addAvailableClip]
  )
  return (
    <>
      <label htmlFor="clips-upload" className="btn btn-sm btn-accent w-full">
        <i className="bi bi-film text-lg"></i> Import clips
      </label>
      <input
        type="file"
        accept=".mp4"
        multiple
        id="clips-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default ClipUploader
