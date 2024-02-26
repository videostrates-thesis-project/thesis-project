import { determineReturnValue } from "./determineReturnValue"

test("can parse string constants", () => {
  const value = determineReturnValue('"hello"', {})

  expect(value).toEqual({
    type: "string",
    value: "hello",
  })
})

test("can parse int constants", () => {
  const value = determineReturnValue("123", {})

  expect(value).toEqual({
    type: "number",
    value: 123,
  })
})

test("can parse float constants", () => {
  const value = determineReturnValue("123.456", {})

  expect(value).toEqual({
    type: "number",
    value: 123.456,
  })
})

test("can parse variables", () => {
  const value = determineReturnValue("variable", {
    variable: {
      type: "string",
      value: "hello",
    },
  })

  expect(value).toEqual({
    type: "string",
    value: "hello",
  })
})

test("can't parse variables if not in context", () => {
  expect(() => {
    determineReturnValue("variable", {})
  }).toThrow(Error)
})

test("can't parse unterminated strings", () => {
  expect(() => {
    determineReturnValue('"hello', {})
  }).toThrow(Error)
})

test("can parse strings with quotes inside", () => {
  const value = determineReturnValue('"hello \\"world\\""', {})

  expect(value).toEqual({
    type: "string",
    value: 'hello \\"world\\"',
  })
})

test("can parse arrays", () => {
  const value = determineReturnValue('["hello", "world"]', {})

  expect(value).toEqual({
    type: "array",
    value: [
      {
        type: "string",
        value: "hello",
      },
      {
        type: "string",
        value: "world",
      },
    ],
  })
})
