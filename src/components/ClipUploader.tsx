import React, { useCallback } from "react"
import { uploadVideo } from "../services/upload"
import { useStore } from "../store"
import VideoClip from "../types/videoClip"

const ClipUploader = () => {
  const { availableClips, setAvailableClips } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0]
      if (!file) return
      const url = await uploadVideo(file)
      if (!url) return // TODO: Show error
      const newClip = { source: url, status: "UNCACHED" } as VideoClip
      setAvailableClips([...availableClips, newClip])
    },
    [availableClips, setAvailableClips]
  )
  return (
    <>
      <label htmlFor="clips-upload" className="btn btn-sm btn-accent w-full">
        <i className="bi bi-film text-lg"></i> Import clips
      </label>
      <input
        type="file"
        accept=".mp4"
        id="clips-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default ClipUploader
