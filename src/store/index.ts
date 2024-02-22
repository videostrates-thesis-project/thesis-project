import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import ClipMetadata from "../types/videoClip"
import { AvailableClip } from "../types/availableClip"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => Promise<void>

  clipsMetadata: { clips: Map<string, ClipMetadata> }
  setClipsMetadata: (clips: Map<string, ClipMetadata>) => void

  metamaxRealm: string | null
  setMetamaxRealm: (realm: string) => void

  playbackState: PlaybackState
  setPlaybackState: (state: PlaybackState) => void

  seek: number
  setSeek: (seek: number) => void

  availableClips: AvailableClip[]

  currentMessages: ChatCompletionMessageParam[]
  addMessage: (
    message: ChatCompletionMessageParam
  ) => ChatCompletionMessageParam[]
}

export const useStore = create(
  persist<AppState>(
    (set, get) => ({
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
      metamaxRealm: null,
      setMetamaxRealm: (realm: string) => set({ metamaxRealm: realm }),
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
      currentMessages: [],
      addMessage: (message: ChatCompletionMessageParam) => {
        set((state) => {
          return { currentMessages: [...state.currentMessages, message] }
        })
        return get().currentMessages
      },
    }),
    {
      name: "thesis-project-storage",
    }
  )
)
