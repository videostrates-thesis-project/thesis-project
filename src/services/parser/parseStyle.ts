import { VideostrateStyle } from "../../types/parsedVideostrate"

export const parseStyle = (
  cssString: string
): {
  style: VideostrateStyle[]
  animations: VideostrateStyle[]
} => {
  // Remove comments and unnecessary whitespace
  cssString = cssString.replace(/\/\*[\s\S]*?\*\//g, "").trim()

  // Split the CSS string by the closing brace to get each block of code, while ignoring nested blocks
  let braceCount = 0
  const blocks: string[] = []
  let currentBlock = ""
  for (let i = 0; i < cssString.length; i++) {
    const char = cssString[i]
    if (char === "{") {
      braceCount++
    } else if (char === "}") {
      braceCount--
    }
    if (braceCount === 0 && char === "}") {
      blocks.push(currentBlock)
      currentBlock = ""
    } else {
      currentBlock += char
    }
  }

  // Map each block to an object containing the selector and content
  const parsedCSS = blocks.map((block) => {
    const selector = block.split("{")[0].trim()
    const style = block
      .substring(block.indexOf("{") + 1, block.length - 1)
      .trim()
    return { selector, style }
  })

  if (!parsedCSS.find((block) => block.selector === "div video")) {
    parsedCSS.push({
      selector: "div video",
      style: "position: relative !important;",
    })
  }

  return {
    style: parsedCSS.filter(
      (block) => !block.selector.startsWith("@keyframes")
    ),
    animations: parsedCSS
      .filter((block) => block.selector.startsWith("@keyframes"))
      .map((block) => {
        return {
          selector: block.selector.split(" ")[1],
          style: block.style,
        }
      }),
  }
}
