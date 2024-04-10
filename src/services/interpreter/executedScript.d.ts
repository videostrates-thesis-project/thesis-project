import { ParsedVideostrate } from "../../types/parsedVideostrate"

interface ExecutedFunction {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arguments: any[]
}

interface ExecutedScript {
  text: string
  script: ExecutedFunction[]
  parsedVideostrate: ParsedVideostrate
}
