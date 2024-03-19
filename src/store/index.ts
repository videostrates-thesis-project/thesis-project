import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import VideoClip, { RawMetadata } from "../types/videoClip"
import { ChatMessage } from "../types/chatMessage"
import { ExecutedScript } from "../services/command/executedScript"
import { Image } from "../types/image"
import { v4 as uuid } from "uuid"

const TOAST_LENGTH = 5000

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

  availableClips: VideoClip[]
  addAvailableClip: (source: string, title: string) => void
  updateClipMetadata: (source: string, metadata: RawMetadata) => void
  deleteAvailableClip: (source: string) => void

  availableImages: Image[]
  setAvailableImages: (images: Image[]) => void

  selectedClipId: string | null
  setSelectedClipId: (id: string | null) => void

  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => ChatMessage[]
  addReactionToMessage: (id: string, reaction: string) => void

  currentMessages: ChatCompletionMessageParam[]
  addMessage: (
    message: ChatCompletionMessageParam
  ) => ChatCompletionMessageParam[]

  pendingChanges: boolean
  setPendingChanges: (unaccepted: boolean) => void

  undoStack: ExecutedScript[]
  setUndoStack: (stack: ExecutedScript[]) => void
  addToUndoStack: (script: ExecutedScript) => void

  redoStack: ExecutedScript[]
  setRedoStack: (stack: ExecutedScript[]) => void
  addToRedoStack: (script: ExecutedScript) => void

  toasts: Toast[]
  addToast: (type: ToastType, title: string, description: string) => void
  removeToast: (id: string) => void

  sideBarTab: SideBarTab
  setSideBarTab: (tab: SideBarTab) => void
}

export const useStore = create<AppState>()(
  persist<AppState>(
    (set, get) => ({
      videostrateUrl: "https://demo.webstrates.net/evil-jellyfish-8/",
      setVideostrateUrl: (url: string) =>
        set({
          videostrateUrl: url,
          availableClips: [],
          availableImages: [],
          seek: 0,
          playing: false,
          playbackState: { frame: 0, time: 0 },
          selectedClipId: null,
          chatMessages: [],
          currentMessages: [],
          pendingChanges: false,
          undoStack: [],
          redoStack: [],
          toasts: [],
        }),
      fileName: "Untitled Videostrate",
      setFileName: (name: string) => set({ fileName: name }),
      parsedVideostrate: new ParsedVideostrate([], []),
      setParsedVideostrate: async (parsed: ParsedVideostrate) =>
        set({
          parsedVideostrate: parsed.clone(),
          pendingChanges: false,
        }),
      pendingChanges: false,
      setPendingChanges: (pendingChanges: boolean) => set({ pendingChanges }),
      playbackState: { frame: 0, time: 0 },
      setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),
      playing: false,
      setPlaying: (playing: boolean) => set({ playing: playing }),
      seek: 0,
      setSeek: (seek: number) => set({ seek: seek }),
      metamaxRealm: null,
      setMetamaxRealm: (realm: string) => set({ metamaxRealm: realm }),
      availableClips: [],
      addAvailableClip: (source: string, title: string) => {
        set((state) => {
          if (state.availableClips.some((clip) => clip.source === source)) {
            return state
          }
          if (title === "") title = "Clip"
          let index = 1
          while (state.availableClips.some((clip) => clip.title === title)) {
            title = `${title} ${index++}`
          }
          return {
            availableClips: [
              ...state.availableClips,
              new VideoClip(source, title),
            ],
          }
        })
      },
      updateClipMetadata: (source: string, metadata: RawMetadata) => {
        set((state) => {
          if (metadata.status === "UNCACHED") return state
          const clips = state.availableClips.map((clip) => {
            if (clip.source === source) {
              return clip.updateMetadata(metadata)
            }
            return clip
          })
          return { availableClips: clips }
        })
      },
      deleteAvailableClip: (source: string) => {
        set((state) => {
          return {
            availableClips: state.availableClips.filter(
              (clip) => clip.source !== source
            ),
          }
        })
      },
      availableImages: [],
      setAvailableImages: (images: Image[]) => set({ availableImages: images }),
      selectedClipId: null,
      setSelectedClipId: (id: string | null) => set({ selectedClipId: id }),
      chatMessages: [],
      addChatMessage: (message: ChatMessage) => {
        set((state) => {
          return {
            chatMessages: [...state.chatMessages, message],
          }
        })
        return get().chatMessages
      },
      addReactionToMessage: (id: string, reaction: string) => {
        set((state) => {
          const messages = state.chatMessages.map((m) => {
            if (m.id === id) {
              return { ...m, reaction }
            }
            return m
          })
          return { chatMessages: messages }
        })
      },
      currentMessages: [],
      addMessage: (message: ChatCompletionMessageParam) => {
        set((state) => {
          const currentMessages = state.currentMessages
          // Find the last message where role = 'user'
          const lastUserMessageIndex = currentMessages
            .map((m) => m.role)
            .lastIndexOf("user")
          const chatLastUserMessageIndex = state.chatMessages
            .map((m) => m.role)
            .lastIndexOf("user")
          const secondLastUserMessageIndex = state.chatMessages
            .map((m) => m.role)
            .lastIndexOf("user", chatLastUserMessageIndex - 1)
          const lastUserMessage = currentMessages[lastUserMessageIndex]
          if (state.chatMessages[secondLastUserMessageIndex]?.content) {
            lastUserMessage.content =
              state.chatMessages[secondLastUserMessageIndex]?.content
          }

          return {
            currentMessages: [...currentMessages, message],
          }
        })
        return get().currentMessages
      },
      undoStack: [],
      setUndoStack: (stack: ExecutedScript[]) => set({ undoStack: stack }),
      addToUndoStack: (script: ExecutedScript) =>
        set((state) => {
          return {
            undoStack: [...state.undoStack, script],
            redoStack: [],
          }
        }),
      redoStack: [],
      setRedoStack: (stack: ExecutedScript[]) => set({ redoStack: stack }),
      addToRedoStack: (script: ExecutedScript) => {
        set((state) => {
          return {
            redoStack: [...state.redoStack, script],
          }
        })
      },
      toasts: [],
      addToast: (type: ToastType, title: string, description: string) => {
        const id = uuid()
        setTimeout(() => {
          get().removeToast(id)
        }, TOAST_LENGTH)

        set((state) => {
          return {
            toasts: [...state.toasts, { id, title, description, type }],
          }
        })
      },
      removeToast: (id: string) => {
        set((state) => {
          return {
            toasts: state.toasts.filter((t) => t.id !== id),
          }
        })
      },
      sideBarTab: "clips",
      setSideBarTab: (tab: SideBarTab) => set({ sideBarTab: tab }),
    }),
    {
      name: "thesis-project-storage",
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          switch (key) {
            case "parsedVideostrate":
              if (value) {
                const castedValue = value as ParsedVideostrate
                return new ParsedVideostrate(
                  castedValue._all,
                  castedValue.images,
                  castedValue.style,
                  castedValue.animations
                )
              }
              break
            case "toasts":
              return []
            case "seek":
              return 0
            case "playing":
              return false
            case "pendingChanges":
              return false
            case "playbackState":
              return { frame: 0, time: 0 }
            case "selectedClipId":
              return null
          }
          return value
        },
      }),
    }
  )
)
