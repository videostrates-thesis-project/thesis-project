import { useStore } from "../store"

const getNextClipIndex = () => {
  const index =
    (useStore
      .getState()
      .availableClips.filter((i) => i.title.match(/Clip \d+/))
      .map((i) => parseInt(i.title.split(" ")[1]))
      .sort((a, b) => b - a)[0] || 0) + 1
  console.log("New Clip Index: ", index)
  return index
}

export default getNextClipIndex
