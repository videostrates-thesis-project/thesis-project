const updateLayers = (
  elements: { layer: number; start: number; end: number }[]
) => {
  const sorted = elements
    .toSorted((a, b) => a.layer - b.layer)
    .map((e) => {
      return { ...e }
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
