import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { useStore } from "../../store"
import executeChangesFunction from "./executeChangesFunction"
import instructions from "./instructions.txt?raw"
import { v4 as uuid } from "uuid"
import { buildReactionMessage } from "./reactionTemplate"
import { azureFunctionRequest } from "../api/api"
import { AzureModelType } from "../api/apiTypes"
import { ChatMessage } from "../../types/chatMessage"
import { runScript } from "../interpreter/run"

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

  async sendChatMessage(text: string) {
    const provider = useStore.getState().aiProvider

    switch (provider) {
      case "openai":
        await this.sendChatMessageToOpenAi(text)
        break
      case "azure":
        await this.sendDefaultChatMessageToAzure(text)
        break
      default:
        throw new Error(`Unknown AI provider: ${provider}`)
    }
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
        await runScript(text)
      } else if (run.status === "requires_action") {
        console.log("Requires action", run)
        clearInterval(interval)
      } else if (["cancelled", "failed", "expired"].includes(run.status)) {
        clearInterval(interval)
        console.error("Run failed:", run.status, run.last_error)
      }
    }, ASSISTANT_POLL_RATE)
  }

  async sendDefaultChatMessageToAzure(text: string) {
    useStore.getState().setIsUiFrozen(true)
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: text,
      }
      if (
        useStore
          .getState()
          .currentMessages.filter((m) => m.message.role === "system").length ===
        0
      ) {
        const systemMessage: ChatCompletionMessageParam = {
          role: "system",
          content: instructions,
        }
        useStore.getState().addMessage(systemMessage)
      }
      const messages = useStore.getState().addMessage(userMessage)

      const message = await this.sendChatMessageToAzureBase<ExecuteChanges>(
        "mirrorverse-gpt-4-turbo",
        messages.map((m) => m.message),
        "execute_changes",
        executeChangesFunction
      )

      /*console.log(messages)
    const response = await azureFunctionRequest({
      model: "mirrorverse-gpt-4-turbo",
      messages: messages,
      tool_choice: { type: "function", function: { name: "execute_changes" } },
      functions: [executeChangesFunction],
    })

    console.log("[ChatGPT] Response", response)
    const message = response as ExecuteChanges*/

      if (message?.script?.includes("generate_image(")) {
        useStore.getState().setCurrentAsyncAction("Generating image...")
      }

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
        // eslint-disable-next-line prettier/prettier
        (await runScript(message.script))?.asPendingChanges()
        useStore.getState().setCurrentAsyncAction(null)
      }
    } finally {
      useStore.getState().setIsUiFrozen(false)
    }
  }

  async sendChatMessageToAzureBase<T>(
    model: AzureModelType,
    messages: ChatCompletionMessageParam[],
    functionName: string,
    functionDefinition: unknown
  ) {
    const response = await azureFunctionRequest({
      model,
      messages,
      tool_choice: { type: "function", function: { name: functionName } },
      functions: [functionDefinition],
    })

    const message = response as T

    return message
  }

  async sendChatMessageToOpenAi(text: string) {
    try {
      useStore.getState().setIsUiFrozen(true)
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: text,
      }
      if (
        useStore
          .getState()
          .currentMessages.filter((m) => m.message.role === "system").length ===
        0
      ) {
        const systemMessage: ChatCompletionMessageParam = {
          role: "system",
          content: instructions,
        }
        useStore.getState().addMessage(systemMessage)
      }
      const messages = useStore.getState().addMessage(userMessage)

      const response = await openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: messages.map((m) => m.message),
        temperature: 0.25,
        max_tokens: 4096,
        tool_choice: {
          type: "function",
          function: { name: "execute_changes" },
        },
        tools: [executeChangesFunction],
      })

      console.log("[ChatGPT] Response", response)
      if (response?.choices.length === 0)
        throw new Error("[ChatGPT] No response")
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
      if (typeof message.explanation !== "string")
        throw new Error("[ChatGPT] Script is not a string")

      if (message?.script?.includes("generate_image(")) {
        useStore.getState().setCurrentAsyncAction("Generating image...")
      }

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
        (await runScript(message.script))?.asPendingChanges()
        useStore.getState().setCurrentAsyncAction(null)
      }
    } finally {
      useStore.getState().setIsUiFrozen(false)
    }
  }

  async sendChatMessageForReaction(
    messages: ChatMessage[],
    addReactionToMessage: (id: string, reaction: string) => void
  ) {
    //const messages = [...useStore.getState().chatMessages]

    // Find last user message in list
    console.log("[ChatGPT] Messages:", messages)
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
    console.log("[ChatGPT] Last user message:", messages[lastUserMessageIndex])
    messages[lastUserMessageIndex] = {
      ...messages[lastUserMessageIndex],
      content: buildReactionMessage(
        (messages[lastUserMessageIndex].content as string) ?? ""
      ),
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content })),
      // messages: [messages.map((m) => ({ role: m.role, content: m.content }))[lastUserMessageIndex]],
    })

    const reaction = response.choices[0].message.content?.trim()
    console.log("[ChatGPT] Reaction:", reaction)
    if (
      !reaction ||
      reaction.toLowerCase().includes("no reaction") ||
      reaction?.charCodeAt(0) < 255
    )
      return

    addReactionToMessage(
      messages[lastUserMessageIndex].id,
      reaction?.slice(0, 3) ?? ""
    )
  }

  public async createImageTitle(prompt: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Create a short title for an image with the following description and DO NOT include anything else in the response:\n\n" +
            prompt,
        },
      ],
    })

    let title = response.choices[0].message.content?.trim()

    if (title?.startsWith("'") || title?.startsWith('"')) {
      title = title.slice(1)
    }

    if (title?.endsWith("'") || title?.endsWith('"')) {
      title = title.slice(0, -1)
    }

    return title
  }

  public async githubCopilotAtHome(
    input: string,
    lineNumber: number,
    column: number
  ) {
    const prompt = `Continue the following code at line number ${lineNumber}, column ${column}, reply only with the next part of the code:\n\n${input}`
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    return response.choices[0].message.content
  }
}

const openAIService = new OpenAIService()

export default openAIService
