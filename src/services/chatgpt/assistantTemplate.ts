import VideoClip from "../../types/videoClip"

export const buildAssistantMessage = (
  clips: VideoClip[],
  style: string,
  html: string,
  clip_id: string | null,
  seek: number,
  prompt: string
) => {
  let selectedClipMessage = `The video player is paused at timestamp (in seconds): ${seek}. The user can implicitly refer to this timestamp in the video. E.g., "Add a clip here"`
  if (clip_id) {
    selectedClipMessage = `The highlighted clip is: id="${clip_id}". The user can refer to this clip explicitly. E.g., "Add a smiley face over the clip"`
  }

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

    ${selectedClipMessage}
    The user input is: "${prompt}"`
}
// If a clip is cropped or added, move other clips if needed.
