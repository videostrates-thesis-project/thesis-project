import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

interface MessageInformation {
  time: string
  activeUndoElementId: string
  message: ChatCompletionMessageParam
}

export default MessageInformation
