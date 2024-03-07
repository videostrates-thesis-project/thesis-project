import { ParsedVideostrate } from "../../types/parsedVideostrate"
import { ChatGptSerializationStrategy } from "../serializationStrategies/chatGptSerializationStrategy"
import { WebstrateSerializationStrategy } from "../serializationStrategies/webstrateSerializationStrategy"

export const serializeVideostrate = (
  parsedVideostrate: ParsedVideostrate,
  strategyType: "webstrate" | "chatGPT"
) => {
  const strategy =
    strategyType === "webstrate"
      ? new WebstrateSerializationStrategy()
      : new ChatGptSerializationStrategy()

  return {
    html: strategy.serializeHtml(parsedVideostrate),
    style: strategy.serializeStyle(parsedVideostrate),
  }
}
