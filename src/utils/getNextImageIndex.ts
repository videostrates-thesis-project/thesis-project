import { useStore } from "../store"

const getNextImageIndex = () => {
  return (
    (useStore
      .getState()
      .availableImages.filter((i) => i.title.match(/Image \d+/))
      .map((i) => parseInt(i.title.split(" ")[1]))
      .sort((a, b) => b - a)[0] || 0) + 1
  )
}

export default getNextImageIndex
