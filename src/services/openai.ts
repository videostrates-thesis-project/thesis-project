import OpenAI from "openai"
import { processCommand } from "./commandProcessor"

const ASSISTANT_POLL_RATE = 5000

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

  async sendMessage(text: string) {
    if (!this.thread) throw new Error("OpenAIService not initialized")

    await openai.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content: text,
    })

    let run = await openai.beta.threads.runs.create(this.thread.id, {
      assistant_id: import.meta.env.VITE_OPENAI_ASSISTANT_ID,
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
        text.split("\n").forEach((line) => processCommand(line))
      } else if (["cancelled", "failed", "expired"].includes(run.status)) {
        clearInterval(interval)
        console.error("Run failed:", run.status, run.last_error)
      }
    }, ASSISTANT_POLL_RATE)
  }
}

const openAIService = new OpenAIService()

export default openAIService
