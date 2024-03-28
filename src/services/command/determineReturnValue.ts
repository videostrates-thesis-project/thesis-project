import { ExecutionContext } from "./executionContext"
import { AcceptedReturnValue, ReturnValue } from "./returnValue"

const stringFunctions = ["length"] as const
type StringFunction = (typeof stringFunctions)[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const determineReturnValueTyped = <T = any>(
  expectedType: AcceptedReturnValue,
  value: string,
  context: ExecutionContext
) => {
  const returnValue = determineReturnValue(value, context)
  if (returnValue.type !== expectedType) {
    throw new Error(`Value "${value}" must be of type "${expectedType}"`)
  }
  return returnValue as ReturnValue<T>
}

export const determineReturnValue = (
  value: string,
  context: ExecutionContext
): ReturnValue => {
  // if value has + signs in it outside of quotes, it's a concatenation
  let quoteCounter = 0
  let singleQuoteCounter = 0
  const parts: string[] = []
  let previousPartIndex = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '"' && value[i - 1] !== "\\") {
      quoteCounter++
    }

    if (value[i] === "'" && value[i - 1] !== "\\") {
      singleQuoteCounter++
    }

    if (
      value[i] === "+" &&
      quoteCounter % 2 === 0 &&
      singleQuoteCounter % 2 === 0
    ) {
      const nextPart = value.slice(previousPartIndex, i - 1).trim()
      parts.push(nextPart)
      previousPartIndex = i + 1
    }
  }
  parts.push(value.slice(previousPartIndex).trim())

  if (parts.length > 1) {
    return {
      type: "string",
      value: parts
        .map((part) => determineReturnValue(part, context).value)
        .join(""),
    }
  }

  // if value starts and ends with square brackets, it's an array
  if (value.startsWith("[") && value.endsWith("]")) {
    const array = value.slice(1, -1).split(",")
    return {
      type: "array" as const,
      value: array.map((item) => determineReturnValue(item.trim(), context)),
    }
  }

  // if value starts and ends with apostrophes, it's a constant string
  const dotSplit = value.split(".")
  if (
    (dotSplit[0].startsWith('"') && dotSplit[0].endsWith('"')) ||
    (dotSplit[0].startsWith("'") && dotSplit[0].endsWith("'"))
  ) {
    if (dotSplit.length === 1) {
      return {
        type: "string" as const,
        value: dotSplit[0].slice(1, -1),
      }
    } else if (dotSplit.length > 2) {
      throw new Error(`String "${value}" cannot have multiple function calls`)
    } else {
      const stringFunction = stringFunctions.find(
        (q) => q === (dotSplit[1].trim() as StringFunction)
      )
      if (stringFunction) {
        switch (stringFunction) {
          case "length":
            return {
              type: "number" as const,
              value: dotSplit[0].slice(1, -1).length,
            }
          default:
            throw new Error(`String function "${dotSplit[1]}" not recognized`)
        }
      }
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
