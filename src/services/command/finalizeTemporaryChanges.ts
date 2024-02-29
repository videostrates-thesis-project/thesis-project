import { useStore } from "../../store"

export const acceptCurrentChanges = () => {
  const working = useStore.getState().workingVideostrate
  if (!working) {
    console.error("Can't accept changes if working videostrate is null")
  }
  useStore.getState().setParsedVideostrate(working!)
  useStore.getState().setWorkingVideostrate(null)
}

export const rejectCurrentChanges = () => {
  useStore.getState().setWorkingVideostrate(null)
}
