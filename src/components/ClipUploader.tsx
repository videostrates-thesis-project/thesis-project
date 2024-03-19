import React, { useCallback } from "react"
import { uploadVideo } from "../services/upload"
import { useStore } from "../store"
import VideoClip from "../types/videoClip"

const ClipUploader = () => {
  const { availableClips, setAvailableClips } = useStore()
  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target?.files || []
      const uploadClipPromises = Array.from(files).map(
        async (file) => await uploadVideo(file)
      )
      const urls = await Promise.all(uploadClipPromises)
      const newClips = urls
        .filter((url): url is string => !!url)
        .map((url) => new VideoClip(url, { status: "UNCACHED" }))
      setAvailableClips([...availableClips, ...newClips])
      // Clear input so that the same file can be uploaded again
      e.target.value = ""
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
        multiple
        id="clips-upload"
        className="hidden"
        onChange={onUpload}
      />
    </>
  )
}

export default ClipUploader
