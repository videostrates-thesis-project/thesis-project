import { ExecutionContext } from "./executionContext"
import { ReturnValue } from "./returnValue"

export const determineReturnValue = (
  value: string,
  context: ExecutionContext
): ReturnValue => {
  // if value starts and ends with apostrophes, it's a constant string
  if (value.startsWith('"') && value.endsWith('"')) {
    return {
      type: "string" as const,
      value: value.slice(1, -1),
    }
  }

  // if value starts with a letter, it's a variable
  if (value.match(/[a-zA-Z]/)) {
    // If context doesn't have the variable as a key
    if (!context[value]) {
      throw new Error(`Variable "${value}" not found in context`)
    }
    return context[value]
  }

  // if value is a number (int, float etc), it's a constant number
  const float = parseFloat(value)
  if (!isNaN(float)) {
    return {
      type: "number" as const,
      value: float,
    }
  }

  throw new Error(`Value "${value}" not recognized`)
}
