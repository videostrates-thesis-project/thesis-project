import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { ParsedVideostrate } from "../types/parsedVideostrate"
import { PlaybackState } from "../types/playbackState"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import VideoClip, { IndexingState, RawMetadata } from "../types/videoClip"
import { ChatMessage } from "../types/chatMessage"
import { Image } from "../types/image"
import { v4 as uuid } from "uuid"
import { CustomElement, VideoClipElement } from "../types/videoElement"
import { serializeVideostrate } from "../services/parser/serializationExecutor"
import { ExecutedScript } from "../services/interpreter/executedScript"

const TOAST_LENGTH = 5000
const DEFAULT_IMAGE_TITLE = "Image"
const DEFAULT_CLIP_TITLE = "Clip"

export interface AppState {
  videostrateUrl: string
  setVideostrateUrl: (url: string) => void

  parsedVideostrate: ParsedVideostrate
  setParsedVideostrate: (parsed: ParsedVideostrate) => Promise<void>

  serializedVideostrate: { html: string; css: string }

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

  availableClips: { source: string; title: string }[]
  clipsMetadata: VideoClip[]
  addAvailableClip: (source: string, title?: string) => void
  updateClipMetadata: (source: string, metadata: RawMetadata) => void
  updateIndexingState: (indexingState: { [url: string]: IndexingState }) => void
  deleteAvailableClip: (source: string) => void

  availableImages: Image[]
  addAvailableImage: (image: Image) => void
  deleteAvailableImage: (url: string) => void

  availableCustomElements: CustomElement[]
  addAvailableCustomElement: (element: CustomElement) => void
  deleteAvailableCustomElement: (id: string) => void

  clearSelection: () => void

  selectedClipId: string | null
  setSelectedClipId: (id: string | null) => void

  selectedImportableClipName: string | null
  setSelectedImportableClipName: (name: string | null) => void

  selectedImportableImage: Image | null
  setSelectedImportableImage: (image: Image | null) => void

  selectedImportableCustomElement: CustomElement | null
  setSelectedImportableCustomElement: (element: CustomElement | null) => void

  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => ChatMessage[]
  addReactionToMessage: (id: string, reaction: string) => void
  resetMessages: () => void

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

  showScriptTab: boolean
  setShowScriptTab: (show: boolean) => void

  currentAsyncAction: string | null
  setCurrentAsyncAction: (action: string | null) => void
}

export const useStore = create<AppState>()(
  persist<AppState>(
    (set, get) => ({
      videostrateUrl: "https://demo.webstrates.net/evil-jellyfish-8/",
      setVideostrateUrl: (url: string) =>
        set({
          videostrateUrl: url,
          availableClips: [],
          clipsMetadata: [],
          availableImages: [],
          seek: 0,
          playing: false,
          playbackState: { frame: 0, time: 0 },
          selectedClipId: null,
          selectedImportableClipName: null,
          selectedImportableImage: null,
          selectedImportableCustomElement: null,
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
      serializedVideostrate: { html: "", css: "" },
      setParsedVideostrate: async (parsed: ParsedVideostrate) =>
        set((state) => {
          const { html, style } = serializeVideostrate(parsed, "webstrate")

          const availableClips = parsed.clips.reduce((acc, element) => {
            return concatAvailableClips(acc, element.source, element.name)
          }, state.availableClips)

          const availableImages = parsed.images.reduce((acc, img) => {
            return concatAvailableImage(acc, img)
          }, state.availableImages)

          return {
            parsedVideostrate: parsed.clone(),
            serializedVideostrate: { html, css: style },
            pendingChanges: false,
            availableClips: availableClips,
            clipsMetadata: getUpdatedMetadata(
              state.clipsMetadata,
              availableClips
            ),
            availableImages,
          }
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
      clipsMetadata: [],
      addAvailableClip: (source: string, title?: string) => {
        set((state) => {
          const availableClips = concatAvailableClips(
            state.clipsMetadata,
            source,
            title
          )
          return {
            availableClips,
            clipsMetadata: getUpdatedMetadata(
              state.clipsMetadata,
              availableClips
            ),
          }
        })
      },
      updateClipMetadata: (source: string, metadata: RawMetadata) => {
        set((state) => {
          if (metadata.status === "UNCACHED") return state
          const clips = state.clipsMetadata.map((clip) => {
            if (clip.source === source) {
              return clip.updateMetadata(metadata)
            }
            return clip
          })
          return { clipsMetadata: clips }
        })
      },
      updateIndexingState: (indexingState: {
        [url: string]: IndexingState
      }) => {
        set((state) => {
          const clips = state.clipsMetadata.map((clip) => {
            const state = indexingState[clip.source]
            if (state) {
              return clip.updateIndexingState(state)
            }
            return clip
          })
          return { clipsMetadata: clips }
        })
      },
      deleteAvailableClip: (source: string) => {
        set((state) => {
          return {
            clipsMetadata: state.clipsMetadata.filter(
              (clip) => clip.source !== source
            ),
            availableClips: state.availableClips.filter(
              (clip) => clip.source !== source
            ),
          }
        })
      },
      availableImages: [],
      addAvailableImage: (image: Image) => {
        set((state) => {
          return {
            availableImages: concatAvailableImage(state.availableImages, image),
          }
        })
      },
      deleteAvailableImage: (url: string) => {
        set((state) => {
          return {
            availableImages: state.availableImages.filter((i) => i.url !== url),
          }
        })
      },
      availableCustomElements: [],
      addAvailableCustomElement: (element: CustomElement) => {
        const newElement = element.clone()
        newElement.id = uuid()
        set((state) => {
          return {
            availableCustomElements: [
              ...state.availableCustomElements,
              newElement,
            ],
          }
        })
      },
      deleteAvailableCustomElement: (id: string) => {
        set((state) => {
          return {
            availableCustomElements: state.availableCustomElements.filter(
              (e) => e.id !== id
            ),
          }
        })
      },
      clearSelection: () => {
        set({
          selectedClipId: null,
          selectedImportableClipName: null,
          selectedImportableImage: null,
          selectedImportableCustomElement: null,
        })
      },
      selectedClipId: null,
      setSelectedClipId: (id: string | null) => {
        get().clearSelection()
        set({ selectedClipId: id })
      },
      selectedImportableClipName: null,
      setSelectedImportableClipName: (name: string | null) => {
        get().clearSelection()
        set({ selectedImportableClipName: name })
      },
      selectedImportableImage: null,
      setSelectedImportableImage: (image: Image | null) => {
        get().clearSelection()
        set({ selectedImportableImage: image })
      },
      selectedImportableCustomElement: null,
      setSelectedImportableCustomElement: (element: CustomElement | null) => {
        get().clearSelection()
        set({ selectedImportableCustomElement: element })
      },
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
      resetMessages: () => {
        set({ chatMessages: [], currentMessages: [] })
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
      sideBarTab: "clips" as const,
      setSideBarTab: (tab: SideBarTab) => set({ sideBarTab: tab }),
      showScriptTab: true,
      setShowScriptTab: (show: boolean) => set({ showScriptTab: show }),
      currentAsyncAction: null,
      setCurrentAsyncAction: (action: string | null) =>
        set({ currentAsyncAction: action }),
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
                  castedValue._all.map((c) => {
                    if (c.type === "video")
                      return new VideoClipElement({
                        ...(c as VideoClipElement),
                        start: c._start,
                        end: c._end,
                        offset: c._offset,
                      })
                    else
                      return new CustomElement({
                        ...(c as CustomElement),
                        start: c._start,
                        end: c._end,
                        offset: c._offset,
                      })
                  }),
                  castedValue.style,
                  castedValue.animations
                )
              }
              break
            case "availableCustomElements":
              return (value as CustomElement[]).map((c) => {
                return new CustomElement({
                  ...(c as CustomElement),
                  start: c._start,
                  end: c._end,
                  offset: c._offset,
                })
              })
            case "clipsMetadata":
              return (value as VideoClip[]).map((c) => {
                return new VideoClip(
                  c.source,
                  c.title,
                  c.status,
                  c.length,
                  c.thumbnailUrl,
                  c.indexingState
                )
              })
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

const concatAvailableClips = (
  availableClips: { source: string; title: string }[],
  source: string,
  title?: string
): { source: string; title: string }[] => {
  if (availableClips.some((clip) => clip.source === source))
    return availableClips

  title = title || DEFAULT_CLIP_TITLE
  let newTitle = title
  let index = 1
  while (
    newTitle === DEFAULT_CLIP_TITLE ||
    availableClips.some((clip) => clip.title === newTitle)
  ) {
    newTitle = `${title} ${index++}`
  }
  return [...availableClips, { source, title: newTitle }]
}

const concatAvailableImage = (availableImages: Image[], image: Image) => {
  if (availableImages.some((i) => i.url === image.url)) return availableImages

  image.title = image.title || DEFAULT_IMAGE_TITLE
  let newTitle = image.title
  let index = 1
  while (
    newTitle === DEFAULT_IMAGE_TITLE ||
    availableImages.some((i) => i.title === newTitle)
  ) {
    newTitle = `${image.title} ${index++}`
  }
  image.title = newTitle
  return [...availableImages, image]
}

const getUpdatedMetadata = (
  clipsMetadata: VideoClip[],
  availableClips: { source: string; title: string }[]
) => {
  return availableClips.map((clip) => {
    const metadata = clipsMetadata.find((c) => c.source === clip.source)
    if (metadata) return metadata
    else return new VideoClip(clip.source, clip.title)
  })
}
