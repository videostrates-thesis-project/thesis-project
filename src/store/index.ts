import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import VideoClip from "../types/videoClip"
import { ChatMessage } from "../types/chatMessage"
import { ExecutedScript } from "../services/command/executedScript"

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

  availableImages: string[]
  setAvailableImages: (images: string[]) => void

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
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void

  sideBarTab: SideBarTab
  setSideBarTab: (tab: SideBarTab) => void
}

export const useStore = create(
  persist<AppState>(
    (set, get) => ({
      videostrateUrl: "https://demo.webstrates.net/evil-jellyfish-8/",
      setVideostrateUrl: (url: string) =>
        set({
          videostrateUrl: url,
          availableClips: [],
          clipsSources: [],
          availableImages: [],
        }),
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
          pendingChanges: false,
        })
      },
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
      clipsSources: [],
      setClipsSources: (sources: string[]) => set({ clipsSources: sources }),
      availableClips: [],
      setAvailableClips: (clips: VideoClip[]) => set({ availableClips: clips }),
      availableImages: [],
      setAvailableImages: (images: string[]) =>
        set({ availableImages: images }),
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
      addToast: (toast: Toast) => {
        console.log("Adding toast", toast)
        setTimeout(() => {
          get().removeToast(toast.id)
        }, toast.length)

        set((state) => {
          return {
            toasts: [...state.toasts, toast],
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
          if ("parsedVideostrate" === key && value) {
            // Manually parse the parsedVideostrate object to retrieve getters and setters
            const castedValue = value as ParsedVideostrate
            return new ParsedVideostrate(
              castedValue._all,
              castedValue.style,
              castedValue.animations
            )
          }
          if ("toasts" === key) {
            return []
          }

          return value
        },
      }),
    }
  )
)
