import { processCommand } from "./processCommand"

test("can process command", () => {
  const recognizedCommands = {
    add_clip: {
      processFn: jest.fn(() => {
        return { type: "number" as const, value: 123 }
      }),
    },
  }
  const context = {}
  processCommand(
    'add_clip("Big Buck Bunny.mp4", 0, 10)',
    recognizedCommands,
    context
  )

  expect(context).toEqual({})
  expect(recognizedCommands.add_clip.processFn).toHaveBeenCalledWith(
    ['"Big Buck Bunny.mp4"', "0", "10"],
    context
  )
})

test("can process command with html", () => {
  const recognizedCommands = {
    add_custom_element: {
      processFn: jest.fn(() => {
        return { type: "string" as const, value: "id" }
      }),
    },
  }
  const context = {}
  processCommand(
    "add_custom_element(\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\", 30, 35)",
    recognizedCommands,
    context
  )

  expect(context).toEqual({})
  expect(recognizedCommands.add_custom_element.processFn).toHaveBeenCalledWith(
    [
      "\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\"",
      "30",
      "35",
    ],
    context
  )
})
