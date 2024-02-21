import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import VideoClip from "../types/videoClip"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => Promise<void>

  metamaxRealm: string | null
  setMetamaxRealm: (realm: string) => void

  playbackState: PlaybackState
  setPlaybackState: (state: PlaybackState) => void

  seek: number
  setSeek: (seek: number) => void

  clipsSources: string[]
  setClipsSources: (sources: string[]) => void

  availableClips: VideoClip[]
  setAvailableClips: (clips: VideoClip[]) => void
}

export const useStore = create(
  persist<AppState>(
    (set) => ({
      videostrateUrl: "https://demo.webstrates.net/black-eel-9/",
      setVideostrateUrl: (url: string) => set({ videostrateUrl: url }),
      parsedVideostrate: new ParsedVideostrate([], []),
      setParsedVideostrate: async (parsed: ParsedVideostrate) =>
        set({
          parsedVideostrate: parsed.clone(),
          clipsSources: parsed.clips.map((c) => c.source),
        }),
      playbackState: { frame: 0, time: 0 },
      setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),
      seek: 0,
      setSeek: (seek: number) => set({ seek: seek }),
      metamaxRealm: null,
      setMetamaxRealm: (realm: string) => set({ metamaxRealm: realm }),
      clipsSources: [],
      setClipsSources: (sources: string[]) => set({ clipsSources: sources }),
      availableClips: [],
      setAvailableClips: (clips: VideoClip[]) => set({ availableClips: clips }),
    }),
    {
      name: "thesis-project-storage",
    }
  )
)
