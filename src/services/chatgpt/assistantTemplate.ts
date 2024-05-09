import { ChatMessage } from "../../types/chatMessage"
import { Image } from "../../types/image"
import VideoClip from "../../types/videoClip"
import { CustomElement } from "../../types/videoElement"

const buildHighlightPromptPlayhead = (playhead: number | null) => {
  if (playhead !== null) {
    return `The playhead is at timestamp (in seconds): ${playhead.toFixed(2)}. The user can refer to this timestamp in the video. E.g., "Add a clip here" or simply "Add a clip"`
  } else {
    return ""
  }
}

const buildHighlightPromptElement = (elementId: string | null) => {
  if (elementId !== null) {
    return `The highlighted element on the timeline is: id="${elementId}". The user can refer to this element. E.g., "Add a smiley face over the clip" or "Move right by 5 seconds"`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableClip = (clipName: string | null) => {
  if (clipName !== null) {
    return `The clip "${clipName}" is highlighted in the importable clips list. The user can refer to this importable clip. E.g., "Add this to the timeline from second 10 to 30."`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableImage = (image: Image | null) => {
  if (image !== null) {
    return `The image with name "${image.title}" is highlighted in the importable images list. Url of the image: ${image.url}. The user can refer to this importable image. E.g., "Add a banner to the video and set this image as the background."`
  } else {
    return ""
  }
}

const buildHighlightPromptImportableCustomElement = (
  customElement: CustomElement | null
) => {
  if (customElement !== null) {
    const newline = "\n"
    return `The custom element with name "${customElement.name}" is highlighted in the importable custom elements list. The user can refer to this importable custom element. E.g., "Add this custom element to the timeline." or "Add to the timeline with some modifications". Html code of the custom element: ${customElement.content.replace(newline, " ").trim()}`
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
    buildHighlightPromptPlayhead(seek) +
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

const buildAvailableClipsList = (clips: VideoClip[]) => {
  return `List of available clips (title, length in seconds):
    ${
      clips
        .map((clip, index) => `${index + 1}. "${clip.title}", ${clip.length}s`)
        .join("\n    ") || "No clips available"
    }`
}

const buildAvailableClipsListWithSrc = (clips: VideoClip[]) => {
  return `List of available clips (title, length in seconds, src):
    ${
      clips
        .map(
          (clip, index) =>
            `${index + 1}. "${clip.title}", ${clip.length}s, ${clip.source}`
        )
        .join("\n    ") || "No clips available"
    }`
}

const buildAvailableImagesList = (images: Image[]) => {
  return `List of available images (title, url):
    ${
      images
        .map((image, index) => `${index + 1}. "${image.title}", ${image.url}`)
        .join("\n    ") || "No images available"
    }`
}

const buildAvailableCustomElementsList = (
  availableCustomElements: CustomElement[]
) => {
  return `List of available custom elements (name, html):
    ${
      availableCustomElements
        .map(
          (element, index) =>
            `${index + 1}. "${element.name}", ${element.content.replaceAll(
              "\n",
              " "
            )}`
        )
        .join("\n    ") || "No custom elements available"
    }`
}

export const buildAssistantMessage = (
  clips: VideoClip[],
  images: Image[],
  availableCustomElements: CustomElement[],
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

  return `${buildAvailableClipsList(clips)}

${buildAvailableImagesList(images)}

${buildAvailableCustomElementsList(availableCustomElements)}

HTML code:
${html}

CSS code:
${style}

${highlightPrompt}

${selectedMessagePrompt}

The user input is: "${prompt}"`
}

export const buildAssistantMessageUncontrolled = (
  clips: VideoClip[],
  images: Image[],
  availableCustomElements: CustomElement[],
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

  return `${buildAvailableClipsListWithSrc(clips)}

${buildAvailableImagesList(images)}

${buildAvailableCustomElementsList(availableCustomElements)}

Videostrates HTML code:
<html>
<head>
  <style id="videostrate-style">
    ${style}
  </style>
</head>
<body>
  ${html}
</body>
</html>

${highlightPrompt}

${selectedMessagePrompt}

The user input is: "${prompt}"

Answer with the modified HTML code that includes changes based on the user input. DO NOT INCLUDE ANYTHING ELSE IN THE RESPONSE BUT THE VALID HTML CODE.`
}
