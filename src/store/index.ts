import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import VideoClip from "../types/videoClip"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => Promise<void>

  fileName: string
  setFileName: (name: string) => void

  metamaxRealm: string | null
  setMetamaxRealm: (realm: string) => void

  playbackState: PlaybackState
  setPlaybackState: (state: PlaybackState) => void

  playing: boolean
  setPlaying: (playing: boolean) => void

  seek: number
  setSeek: (seek: number) => void

  clipsSources: string[]
  setClipsSources: (sources: string[]) => void

  availableClips: VideoClip[]
  setAvailableClips: (clips: VideoClip[]) => void

  currentMessages: ChatCompletionMessageParam[]
  addMessage: (
    message: ChatCompletionMessageParam
  ) => ChatCompletionMessageParam[]
}

export const useStore = create(
  persist<AppState>(
    (set, get) => ({
      videostrateUrl: "https://demo.webstrates.net/evil-jellyfish-8/",
      setVideostrateUrl: (url: string) =>
        set({ videostrateUrl: url, availableClips: [], clipsSources: [] }),
      fileName: "Untitled Videostrate",
      setFileName: (name: string) => set({ fileName: name }),
      parsedVideostrate: new ParsedVideostrate([], []),
      setParsedVideostrate: async (parsed: ParsedVideostrate) => {
        const uniqueClipSources = [
          ...new Set(parsed.clips.map((c) => c.source)),
        ]
        set({
          parsedVideostrate: parsed.clone(),
          clipsSources: uniqueClipSources,
        })
      },
      playbackState: { frame: 0, time: 0 },
      setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),
      playing: false,
      setPlaying: (playing: boolean) => set({ playing: playing }),
      seek: 0,
      setSeek: (seek: number) => set({ seek: seek }),
      metamaxRealm: null,
      setMetamaxRealm: (realm: string) => set({ metamaxRealm: realm }),
      clipsSources: [],
      setClipsSources: (sources: string[]) => set({ clipsSources: sources }),
      availableClips: [],
      setAvailableClips: (clips: VideoClip[]) => set({ availableClips: clips }),
      currentMessages: [],
      addMessage: (message: ChatCompletionMessageParam) => {
        set((state) => {
          return {
            currentMessages: [...state.currentMessages, message],
          }
        })
        return get().currentMessages
      },
    }),
    {
      name: "thesis-project-storage",
    }
  )
)
