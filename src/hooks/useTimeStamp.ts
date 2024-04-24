import { useMemo } from "react"
import formatTime from "../utils/formatTime"

export const useTimeStamp = (seconds: number) => {
  return useMemo(() => {
    return formatTime(seconds)
  }, [seconds])
}
