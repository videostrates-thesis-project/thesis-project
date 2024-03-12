import { OpenAIClient, AzureKeyCredential } from "@azure/openai"
import { useStore } from "../../store"
import executeChangesFunction from "./executeChangesFunction"
import { parseAndExecuteScript } from "../command/executeScript"
import instructions from "./instructions.txt?raw"
import { ChatRequestMessage } from "@azure/openai"

// const ASSISTANT_POLL_RATE = 5000

interface ExecuteChanges {
  script: string
  explanation: string
}

const openai = new OpenAIClient(
  "https://mirrorverse.openai.azure.com",
  import.meta.env.VITE_OPENAI_API_KEY,
  // {
  //   apiVersion: "2024-02-15-preview"
  //   // , allowInsecureConnection: true
  // }
)

class OpenAIService {
  // thread: OpenAI.Beta.Thread | null = null
  // public messages: OpenAI.Beta.Threads.Messages.ThreadMessage[] = []

  async init() {
    // this.thread = await openai.beta.threads.create()
  }

  /**
   * @deprecated Use `sendChatMessage` instead.
   */
  // async sendAssistantMessage(text: string) {
  //   if (!this.thread) throw new Error("OpenAIService not initialized")

  //   await openai.beta.threads.messages.create(this.thread.id, {
  //     role: "user",
  //     content: text,
  //   })

  //   let run = await openai.beta.threads.runs.create(this.thread.id, {
  //     assistant_id: "asst_MTOg1HPrk1J497bXa4k1II52",
  //     instructions: "",
  //   })

  //   const interval = setInterval(async () => {
  //     run = await openai.beta.threads.runs.retrieve(this.thread!.id, run.id)

  //     if (run.status === "completed") {
  //       clearInterval(interval)

  //       this.messages = (
  //         await openai.beta.threads.messages.list(this.thread!.id)
  //       ).data
  //       const latestMessage = this.messages[0]
  //       const text = (
  //         latestMessage.content.find(
  //           (q) => q.type === "text"
  //         ) as OpenAI.Beta.Threads.Messages.MessageContentText
  //       ).text.value
  //       parseAndExecuteScript(text)
  //     } else if (run.status === "requires_action") {
  //       console.log("Requires action", run)
  //       clearInterval(interval)
  //     } else if (["cancelled", "failed", "expired"].includes(run.status)) {
  //       clearInterval(interval)
  //       console.error("Run failed:", run.status, run.last_error)
  //     }
  //   }, ASSISTANT_POLL_RATE)
  // }

  async sendChatMessage(text: string) {
    const userMessage: ChatRequestMessage = {
      role: "user",
      content: text,
    }
    if (
      useStore.getState().currentMessages.filter((m) => m.role === "system")
        .length === 0
    ) {
      const systemMessage: ChatRequestMessage = {
        role: "system",
        content: instructions,
      }
      useStore.getState().addMessage(systemMessage)
    }
    const messages = useStore.getState().addMessage(userMessage)

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4-turbo-preview",
    //   messages: messages,
    //   tool_choice: { type: "function", function: { name: "execute_changes" } },
    //   tools: [executeChangesFunction],
    // })

    // TEST REQUEST
    const completions  = await openai.getCompletions(
      "mirrorverse-gpt-4",
      ["Hello, I'm a human."],
      // { requestOptions: { headers: { "Access-Control-Allow-Origin": "*" } } }
    )
    console.log(completions)

    // ACTUAL REQUEST
    // const events = await openai.streamChatCompletions(
    //   "mirrorverse-gpt-4",
    //   messages,
    //   { maxTokens: 2000 }
    // )
    //   // https://mirrorverse.openai.azure.com/openai/deployments/mirrorverse-gpt-4/chat/completions?api-version=2024-02-15-preview
    // for await (const event of events) {
    //   for (const choice of event.choices) {
    //     const toolCall = choice.delta?.toolCalls?.[0]
    //     if (toolCall?.function?.name === "execute_changes") {
    //       const messageString = toolCall.function.arguments
    //       const message = JSON.parse(messageString) as ExecuteChanges
    //       if (!message.explanation)
    //         throw new Error("[ChatGPT] No script explanation in response")

    //       if (
    //         typeof message.script !== "string" ||
    //         typeof message.explanation !== "string"
    //       )
    //         throw new Error("[ChatGPT] Script or explanation not a string")

    //       const chatMessage: ChatRequestMessage = {
    //         role: "assistant",
    //         content: JSON.stringify(message),
    //       }
    //       useStore.getState().addMessage(chatMessage)
    //       useStore
    //         .getState()
    //         .addChatMessage({ role: "assistant", content: message.explanation })

    //       if (message.script) {
    //         parseAndExecuteScript(message.script)
    //         useStore.getState().setPendingChanges(true)
    //       }
    //     }
    //   }
    // }

    // throw new Error("[ChatGPT] No response")
  }
}

const openAIService = new OpenAIService()

export default openAIService
