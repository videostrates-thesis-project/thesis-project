import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { VideoElement } from "../../types/videoElement"

export abstract class SerializationStrategyBase {
  public serialize(parsedVideostrate: ParsedVideostrate): string {
    const serializedElements = parsedVideostrate.all.map((element) => {
      return this.serializeElement(element)
    })
    const html = serializedElements.join("\n")
    return html
  }

  protected abstract serializeElement(element: VideoElement): string
}
