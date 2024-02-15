import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import ClipMetadata from "../types/videoClip"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => Promise<void>

  clipsMetadata: { clips: Map<string, ClipMetadata> }
  setClipsMetadata: (clips: Map<string, ClipMetadata>) => void

  metaMaxRealm: string | null
  setMetaMaxRealm: (realm: string) => void

  playbackState: PlaybackState
  setPlaybackState: (state: PlaybackState) => void

  seek: number
  setSeek: (seek: number) => void
}

export const useStore = create(
  persist<AppState>(
    (set) => ({
      videostrateUrl: "https://demo.webstrates.net/black-eel-9/",
      setVideostrateUrl: (url: string) => set({ videostrateUrl: url }),
      parsedVideostrate: new ParsedVideostrate([], []),
      setParsedVideostrate: async (parsed: ParsedVideostrate) =>
        set({ parsedVideostrate: parsed.clone() }),
      clipsMetadata: { clips: new Map() },
      setClipsMetadata: (clips: Map<string, ClipMetadata>) =>
        set({ clipsMetadata: { clips: clips } }),
      playbackState: { frame: 0, time: 0 },
      setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),
      seek: 0,
      setSeek: (seek: number) => set({ seek: seek }),
      metaMaxRealm: null,
      setMetaMaxRealm: (realm: string) => set({ metaMaxRealm: realm }),
    }),
    {
      name: "thesis-project-storage",
    }
  )
)
