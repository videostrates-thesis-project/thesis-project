import * as acorn from "acorn"
import { Interpreter } from "./interpreter"
import { Visitor } from "./visitor"

export const parse = async (script: string) => {
  const body = acorn.parse(script, { ecmaVersion: "latest" }).body

  const interpreter = new Interpreter(new Visitor())
  return await interpreter.interpret(body)
}
