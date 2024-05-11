import instructionsUncontrolled from "./instructions-uncontrolled.ts"
import { useStore } from "../../store"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { azureChatRequest } from "../api/api"
import { parseVideostrate } from "../videostrateParser"
import { buildAssistantMessageUncontrolled } from "./assistantTemplate"
import { serializeVideostrate } from "../parser/serializationExecutor"
import { v4 as uuid } from "uuid"

// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   organization: import.meta.env.VITE_OPENAI_ORG_ID,
//   dangerouslyAllowBrowser: true,
// })

class OpenAIServiceUncontrolled {
  async sendScriptExecutionMessage(text: string): Promise<string> {
    console.log("[OpenAIUncontrolled] Sending script execution message: ", text)
    const store = useStore.getState()
    const serialized = serializeVideostrate(
      store.parsedVideostrate,
      "webstrate"
    )

    const prompt = buildAssistantMessageUncontrolled(
      store.clipsMetadata,
      store.availableImages,
      store.availableCustomElements,
      serialized.style,
      serialized.html,
      store.selectedClip?.id ?? null,
      store.selectedImportableClipName,
      store.selectedImportableImage,
      store.selectedImportableCustomElement,
      store.selectedChatMessage,
      store.playbackState.time,
      text
    )

    useStore.getState().setIsUiFrozen(true)
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: prompt,
      }

      if (
        useStore
          .getState()
          .currentMessages.filter((m) => m.message.role === "system").length ===
        0
      ) {
        const systemMessage: ChatCompletionMessageParam = {
          role: "system",
          content: instructionsUncontrolled,
        }
        useStore.getState().addMessage(systemMessage)
      }
      const messages = useStore.getState().addMessage(userMessage)

      const response = await azureChatRequest({
        model: "mirrorverse-gpt-4-turbo",
        messages: messages.map((m) => m.message),
      })

      let newVideostrate = response.response

      newVideostrate = newVideostrate
        .replace(/^```html\n/, "")
        .replace(/```$/, "")

      console.log("[OpenAIUncontrolled] New videostrate:\n", newVideostrate)

      const parsedVideostrate = parseVideostrate(newVideostrate)
      useStore.getState().setParsedVideostrate(parsedVideostrate)

      const chatMessage: ChatCompletionMessageParam = {
        role: "assistant",
        content: newVideostrate,
      }
      useStore.getState().addMessage(chatMessage)
      useStore.getState().addChatMessage({
        role: "assistant",
        content: "Certainly! I tried my best.",
        id: uuid(),
      })

      return newVideostrate
    } finally {
      useStore.getState().setIsUiFrozen(false)
    }
  }
}

const openAIServiceUncontrolled = new OpenAIServiceUncontrolled()

export default openAIServiceUncontrolled
