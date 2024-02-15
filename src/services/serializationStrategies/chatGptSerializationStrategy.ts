import { useStore } from "../../store"
import {
  CustomElement,
  VideoClipElement,
  VideoElement,
} from "../../types/videoElement"
import { SerializationStrategyBase } from "./serializationStrategyBase"

export class ChatGptSerializationStrategy extends SerializationStrategyBase {
  protected serializeElement(element: VideoElement): string {
    if (element.nodeType === "video") {
      const clip = element as VideoClipElement
      const availableClip = useStore
        .getState()
        .availableClips.find((c) => c.source === clip.source)
      return `<video id="${clip.id}" class="composited" absolute-start="${clip.start}" absolute-end="${clip.end}" relative-start="${clip.offset ?? 0}" relative-end="${clip.end - clip.start + clip.offset}" clip-name="${availableClip?.name}"><source src="${clip.source}" /></video>`
    } else {
      const custom = element as CustomElement
      return `<${element.nodeType} id="${element.id}" class="composited" absolute-start="${element.start}" absolute-end="${element.end}" relative-start="${element.offset ?? 0}" clip-end="${element.end - element.start + element.offset}">${custom.content}</${element.nodeType}>`
    }
  }
}
