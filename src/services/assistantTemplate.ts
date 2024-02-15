import { AvailableClip } from "../types/availableClip"

export const buildAssistantMessage = (
  clips: AvailableClip[],
  html: string,
  clip_id: string,
  prompt: string
) => {
  return `List of available clips:
    ${clips
      .map(
        (clip, index) =>
          `${index + 1}. "${clip.name}", ${clip.length}, "${clip.source}"`
      )
      .join("\n    ")}
    
    HTML code:
    ${html}
     
    The highlighted clip is: id=${clip_id}". The user can implicitly refer to this clip.
    If a clip is cropped or added, move other clips if needed.
    
    The user input is: "${prompt}"`
}
