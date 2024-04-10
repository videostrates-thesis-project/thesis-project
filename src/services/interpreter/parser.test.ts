import { parse } from "./parser"

test("can parse command", () => {
  parse("print(`hello ${4 * 'hello'.length}`)")

  expect(true).toBe(true)
})
