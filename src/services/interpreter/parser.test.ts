import { parse } from "./parser"

test("can parse command", () => {
  // parse("print(`hello ${4 * 'hello'.length}`)")
  parse("asd = 1234")

  expect(true).toBe(true)
})
