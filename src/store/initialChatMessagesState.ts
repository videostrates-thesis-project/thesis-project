import { ChatMessage } from "../types/chatMessage"
import { v4 as uuid } from "uuid"
import MessageInformation from "../types/messageInformation"

const initialCurrentMessages = (): MessageInformation[] => {
  return [
    {
      time: new Date().toISOString(),
      activeUndoElementId: "",
      message: {
        role: "assistant",
        content: getWelcomeMessageString(),
      },
    },
  ]
}

const initialChatMessages = (): ChatMessage[] => {
  return [
    {
      id: uuid(),
      role: "assistant",
      content: getWelcomeMessageString(),
    },
  ]
}

const getWelcomeMessageString = () => {
  return `Hello! I'm an AI assistant designed to help you with video editing tasks. 
  I can:
  - add or edit clips and other elements,
  - modify HTML code of custom elements, 
  - generate images
  - access the library of reusable elements and the current playhead position
  - see what is currently selected in the library, the timeline or the chat. The selection will be marked with magical sparkles!
  
  Unfortunately, I don't have access to searching in clips transcript yet.
  
  Feel free to ask me anything!
  `
}

export { initialCurrentMessages, initialChatMessages }
