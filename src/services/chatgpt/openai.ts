import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { useStore } from "../../store"
import executeChangesFunction from "./executeChangesFunction"
import { parseAndExecuteScript } from "../command/executeScript"
import instructions from "./instructions.txt?raw"
import { v4 as uuid } from "uuid"
import { buildReactionMessage } from "./reactionTemplate"
import { azureFunctionRequest } from "../api/api"

const ASSISTANT_POLL_RATE = 5000

interface ExecuteChanges {
  script: string
  explanation: string
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  organization: import.meta.env.VITE_OPENAI_ORG_ID,
  dangerouslyAllowBrowser: true,
})

class OpenAIService {
  thread: OpenAI.Beta.Thread | null = null
  public messages: OpenAI.Beta.Threads.Messages.ThreadMessage[] = []

  async init() {
    this.thread = await openai.beta.threads.create()
  }

  /**
   * @deprecated Use `sendChatMessage` instead.
   */
  async sendAssistantMessage(text: string) {
    if (!this.thread) throw new Error("OpenAIService not initialized")

    await openai.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content: text,
    })

    let run = await openai.beta.threads.runs.create(this.thread.id, {
      assistant_id: "asst_MTOg1HPrk1J497bXa4k1II52",
      instructions: "",
    })

    const interval = setInterval(async () => {
      run = await openai.beta.threads.runs.retrieve(this.thread!.id, run.id)

      if (run.status === "completed") {
        clearInterval(interval)

        this.messages = (
          await openai.beta.threads.messages.list(this.thread!.id)
        ).data
        const latestMessage = this.messages[0]
        const text = (
          latestMessage.content.find(
            (q) => q.type === "text"
          ) as OpenAI.Beta.Threads.Messages.MessageContentText
        ).text.value
        await parseAndExecuteScript(text)
      } else if (run.status === "requires_action") {
        console.log("Requires action", run)
        clearInterval(interval)
      } else if (["cancelled", "failed", "expired"].includes(run.status)) {
        clearInterval(interval)
        console.error("Run failed:", run.status, run.last_error)
      }
    }, ASSISTANT_POLL_RATE)
  }

  async sendChatMessageToAzure(text: string) {
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: text,
    }
    if (
      useStore.getState().currentMessages.filter((m) => m.role === "system")
        .length === 0
    ) {
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: instructions,
      }
      useStore.getState().addMessage(systemMessage)
    }
    const messages = useStore.getState().addMessage(userMessage)

    console.log(messages)
    const response = await azureFunctionRequest({
      model: "mirrorverse-gpt-4-turbo",
      messages: messages,
      tool_choice: { type: "function", function: { name: "execute_changes" } },
      functions: [executeChangesFunction],
    })

    console.log("[ChatGPT] Response", response)
    const message = response as ExecuteChanges

    const chatMessage: ChatCompletionMessageParam = {
      role: "assistant",
      content: JSON.stringify(message),
    }
    useStore.getState().addMessage(chatMessage)
    useStore.getState().addChatMessage({
      role: "assistant",
      content: message.explanation,
      id: uuid(),
    })

    if (message.script) {
      await parseAndExecuteScript(message.script)
      useStore.getState().setPendingChanges(true)
    }
  }

  /**
   * @deprecated Use `sendChatMessage` to use our local pythonb backend instead.
   */
  async sendChatMessageToOpenAi(text: string) {
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: text,
    }
    if (
      useStore.getState().currentMessages.filter((m) => m.role === "system")
        .length === 0
    ) {
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: instructions,
      }
      useStore.getState().addMessage(systemMessage)
    }
    const messages = useStore.getState().addMessage(userMessage)

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      tool_choice: { type: "function", function: { name: "execute_changes" } },
      tools: [executeChangesFunction],
    })

    console.log("[ChatGPT] Response", response)
    if (response?.choices.length === 0) throw new Error("[ChatGPT] No response")
    const choice = response.choices[0]
    if (choice.message.tool_calls?.length === 0)
      throw new Error("[ChatGPT] No tool calls")
    const toolCall = choice.message.tool_calls?.[0]
    if (!toolCall?.function?.arguments)
      throw new Error("[ChatGPT] No function arguments")

    const messageString = toolCall?.function.arguments
    const message = JSON.parse(messageString) as ExecuteChanges
    if (!message.explanation)
      throw new Error("[ChatGPT] No script explanation in response")
    if (
      typeof message.script !== "string" ||
      typeof message.explanation !== "string"
    )
      throw new Error("[ChatGPT] Script or explanation not a string")

    const chatMessage: ChatCompletionMessageParam = {
      role: "assistant",
      content: JSON.stringify(message),
    }
    useStore.getState().addMessage(chatMessage)
    useStore.getState().addChatMessage({
      role: "assistant",
      content: message.explanation,
      id: uuid(),
    })

    if (message.script) {
      await parseAndExecuteScript(message.script)
      useStore.getState().setPendingChanges(true)
    }
  }

  async sendChatMessageForReaction() {
    const messages = [...useStore.getState().chatMessages]

    // Find last user message in list
    let lastUserMessageIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessageIndex = i
        break
      }
    }
    if (lastUserMessageIndex === -1) {
      throw new Error("No user message found")
    }
    messages[lastUserMessageIndex] = {
      ...messages[lastUserMessageIndex],
      content: buildReactionMessage(
        (messages[lastUserMessageIndex].content as string) ?? ""
      ),
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const reaction = response.choices[0].message.content?.trim()
    console.log("[ChatGPT] Reaction:", reaction)
    if (!reaction || reaction.toLowerCase().includes("no reaction")) return

    useStore
      .getState()
      .addReactionToMessage(
        messages[lastUserMessageIndex].id,
        reaction?.slice(0, 2) ?? ""
      )
  }
}

const openAIService = new OpenAIService()

export default openAIService
