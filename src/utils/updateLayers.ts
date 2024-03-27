import { VideoElement } from "../types/videoElement"

const updateLayers = (elements: VideoElement[]) => {
  const sorted = elements
    .toSorted((a, b) => {
      if (a.layer !== b.layer) {
        return a.layer - b.layer
      } else {
        return a.start - b.start
      }
    })
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
  return sorted
}

export default updateLayers
