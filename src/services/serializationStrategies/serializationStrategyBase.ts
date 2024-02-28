import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { VideoElement } from "../../types/videoElement"

export abstract class SerializationStrategyBase {
  public serializeHtml(parsedVideostrate: ParsedVideostrate): string {
    const serializedElements = parsedVideostrate.all.map((element) => {
      return this.serializeElement(element)
    })
    const html = serializedElements.join("\n")
    return html
  }

  public serializeStyle(parsedVideostrate: ParsedVideostrate): string {
    return parsedVideostrate.style
      .map((style) => {
        return `${style.selector} { ${style.style} }`
      })
      .concat(
        parsedVideostrate.animations.map((style) => {
          return `@keyframes ${style.selector} { ${style.style} }`
        })
      )
      .join("\n")
  }

  protected abstract serializeElement(element: VideoElement): string
}
