import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import { AvailableClip } from "../types/availableClip"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => void

  playbackState: PlaybackState
  setPlaybackState: (state: PlaybackState) => void

  seek: number
  setSeek: (seek: number) => void

  availableClips: AvailableClip[]
}

export const useStore = create(
  persist<AppState>(
    (set) => ({
      videostrateUrl: "https://demo.webstrates.net/black-eel-9/",
      setVideostrateUrl: (url: string) => set({ videostrateUrl: url }),
      parsedVideostrate: new ParsedVideostrate([], []),
      setParsedVideostrate: (parsed: ParsedVideostrate) =>
        set({ parsedVideostrate: parsed.clone() }),
      playbackState: { frame: 0, time: 0 },
      setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),
      seek: 0,
      setSeek: (seek: number) => set({ seek: seek }),
      availableClips: [
        {
          name: "Big Buck Bunny",
          source:
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          length: 60,
        },
        {
          name: "Elephants Dream",
          source:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          length: 60,
        },
      ],
    }),
    {
      name: "thesis-project-storage",
    }
  )
)
