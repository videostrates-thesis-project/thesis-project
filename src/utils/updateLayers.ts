import { VideoElement } from "../types/videoElement"

const updateLayers = (elements: VideoElement[]) => {
  const sorted = elements
    .toSorted((a, b) => a.layer - b.layer)
    .map((e) => {
      return e.clone()
    })
  let prevElementLayer = 0
  let currentLayer = 0
  sorted.forEach((element, index) => {
    if (index > 0) {
      const prevElement = sorted[index - 1]
      if (
        prevElementLayer !== element.layer ||
        (prevElement.start < element.end && prevElement.end > element.start)
      ) {
        currentLayer += 1
      }
    }
    prevElementLayer = element.layer
    element.layer = currentLayer
  })
  const results = elements
    .map((element) => {
      return sorted.find((e) => e.id === element.id)
    })
    .filter((e): e is VideoElement => e !== undefined)
  console.log("updateLayers, results ", results)
  return results
}

export default updateLayers
