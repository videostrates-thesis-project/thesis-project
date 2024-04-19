import { ChatMessage } from "../../types/chatMessage"
import { Image } from "../../types/image"
import VideoClip from "../../types/videoClip"
import { CustomElement } from "../../types/videoElement"

const buildHighlightPromptPlayerhead = (playerhead: number | null) => {
  if (playerhead !== null) {
    return `The playerhead is at timestamp (in seconds): ${playerhead.toFixed(2)}. The user can implicitly refer to this timestamp in the video. E.g., "Add a clip here"`
  } else {
    return ""
  }
}

const buildHighlightPromptElement = (elementId: string | null) => {
  if (elementId !== null) {
    return `The highlighted element on the timeline is: id="${elementId}". The user can refer to this element explicitly. E.g., "Add a smiley face over the clip"`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableClip = (clipName: string | null) => {
  if (clipName !== null) {
    return `The clip "${clipName}" is highlighted in the importable clips list. The user can refer to this importable clip explicitly. E.g., "Add this to the timeline from second 10 to 30."`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableImage = (image: Image | null) => {
  if (image !== null) {
    return `The image with name "${image.title}" is highlighted in the importable images list. Url of the image: ${image.url}. The user can refer to this importable image explicitly. E.g., "Add a banner to the video and set this image as the background."`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableCustomElement = (
  customElement: CustomElement | null
) => {
  if (customElement !== null) {
    const newline = "\n"
    return `The custom element with name "${customElement.name}" is highlighted in the importable custom elements list. The user can refer to this importable custom element explicitly. E.g., "Add this custom element to the timeline.". Html code of the custom element: ${customElement.content.replace(newline, " ").trim()}`
  } else {
    return ""
  }
}

const validateHighlightCombination = (
  selectedClipId: string | null,
  selectedImportableClipName: string | null,
  selectedImportableImage: Image | null,
  selectedCustomElement: CustomElement | null
) => {
  const numOfHighlights = [
    selectedClipId,
    selectedImportableClipName,
    selectedImportableImage,
    selectedCustomElement,
  ]
    .map((e) => (e ? 1 : 0) as number)
    .reduce((a, b) => a + b, 0)

  return numOfHighlights <= 1
}

const buildHighlightPrompt = (
  selectedClipId: string | null,
  selectedImportableClipName: string | null,
  selectedImportableImage: Image | null,
  selectedImportableCustomElement: CustomElement | null,
  seek: number | null
) => {
  validateHighlightCombination(
    selectedClipId,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement
  )

  return (
    buildHighlightPromptPlayerhead(seek) +
    "\n" +
    buildHighlightPromptElement(selectedClipId) +
    "\n" +
    buildHighlightPromptImportableClip(selectedImportableClipName) +
    "\n" +
    buildHighlightPromptImportableImage(selectedImportableImage) +
    "\n" +
    buildHighlightPromptImportableCustomElement(selectedImportableCustomElement)
  ).trim()
}

const buildSelectedMessagePrompt = (
  selectedChatMessage: ChatMessage | null
) => {
  if (selectedChatMessage !== null) {
    return `The user replies to the following message sent by the ${selectedChatMessage.role}: "${selectedChatMessage.content}".`
  } else {
    return ""
  }
}

export const buildAssistantMessage = (
  clips: VideoClip[],
  style: string,
  html: string,
  selectedClipId: string | null,
  selectedImportableClipName: string | null,
  selectedImportableImage: Image | null,
  selectedImportableCustomElement: CustomElement | null,
  selectedChatMessage: ChatMessage | null,
  seek: number,
  prompt: string
) => {
  const highlightPrompt = buildHighlightPrompt(
    selectedClipId,
    selectedImportableClipName,
    selectedImportableImage,
    selectedImportableCustomElement,
    seek
  )

  const selectedMessagePrompt = buildSelectedMessagePrompt(selectedChatMessage)

  return `List of available clips:
${clips
  .map(
    (clip, index) =>
      `${index + 1}. "${clip.title}", ${clip.length}, "${clip.source}"`
  )
  .join("\n    ")}

HTML code:
${html}

CSS code:
${style}

${highlightPrompt}

${selectedMessagePrompt}

The user input is: "${prompt}"`
}
