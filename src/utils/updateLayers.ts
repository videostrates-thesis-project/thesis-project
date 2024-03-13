const updateLayers = (
  elements: { layer: number; start: number; end: number }[]
) => {
  const sorted = elements.toSorted((a, b) => a.layer - b.layer)
  let currentLayer = 0
  sorted.forEach((element, index) => {
    if (index > 0) {
      const prevElement = sorted[index - 1]
      if (
        prevElement.layer !== element.layer ||
        prevElement.end > element.start
      ) {
        currentLayer += 1
      }
    }
    element.layer = currentLayer
  })
  return sorted
}

export default updateLayers
