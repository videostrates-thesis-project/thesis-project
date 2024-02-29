import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { useStore } from "../../store"
import executeChangesFunction from "./executeChangesFunction"
import { executeScript } from "../command/executeScript"
import instructions from "./instructions.txt?raw"

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
        executeScript(text)
      } else if (run.status === "requires_action") {
        console.log("Requires action", run)
        clearInterval(interval)
      } else if (["cancelled", "failed", "expired"].includes(run.status)) {
        clearInterval(interval)
        console.error("Run failed:", run.status, run.last_error)
      }
    }, ASSISTANT_POLL_RATE)
  }

  async sendChatMessage(text: string) {
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

    console.log(response)
    if (response?.choices.length === 0) throw new Error("[ChatGPT] No response")
    const choice = response.choices[0]
    if (choice.message.tool_calls?.length === 0)
      throw new Error("[ChatGPT] No tool calls")
    const toolCall = choice.message.tool_calls?.[0]
    if (!toolCall?.function?.arguments)
      throw new Error("[ChatGPT] No function arguments")

    const messageString = toolCall?.function.arguments
    const message = JSON.parse(messageString) as ExecuteChanges
    if (!message.script || !message.explanation)
      throw new Error("[ChatGPT] No script or explanation")
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
    useStore
      .getState()
      .addChatMessage({ role: "assistant", content: message.explanation })

    //processScript(message.script)
    executeScript(message.script, "temporary")
  }
}

const openAIService = new OpenAIService()

export default openAIService
