import { useStore } from "../../store"
import { ParsedVideostrate } from "../../types/parsedVideostrate"

export class WorkingContext {
  setVideostrate: (videostrate: ParsedVideostrate) => void
  getVideostrate: () => ParsedVideostrate

  constructor(
    setVideostrate: (videostrate: ParsedVideostrate) => void,
    getVideostrate: () => ParsedVideostrate
  ) {
    this.setVideostrate = setVideostrate
    this.getVideostrate = getVideostrate
  }
}

export const mainContext = new WorkingContext(
  (videostrate: ParsedVideostrate) => {
    useStore.getState().setParsedVideostrate(videostrate)
  },
  () => {
    return useStore.getState().parsedVideostrate
  }
)

export const workingContext = new WorkingContext(
  (videostrate: ParsedVideostrate) => {
    useStore.getState().setWorkingVideostrate(videostrate)
  },
  () => {
    let videostrate = useStore.getState().workingVideostrate
    if (!videostrate) {
      videostrate = useStore.getState().parsedVideostrate
      console.log("Parsed videostrate", videostrate)
      videostrate = videostrate.clone()
      useStore.getState().setWorkingVideostrate(videostrate)
    }
    return videostrate
  }
)
