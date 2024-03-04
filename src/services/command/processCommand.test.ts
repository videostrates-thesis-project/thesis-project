/* eslint-disable @typescript-eslint/no-explicit-any */
import { executeCommand } from "./processCommand"
import { mockWorkingContext } from "./workingContext"

test("can process command", () => {
  const recognizedCommands = {
    add_clip: {
      processFn: jest.fn(() => {
        return { type: "number" as const, value: 123 }
      }),
    },
  }
  const context = {}
  executeCommand(
    {
      command: "add_clip",
      args: ['"Big Buck Bunny.mp4"', "0", "10"],
    },
    recognizedCommands as any,
    context,
    mockWorkingContext
  )

  expect(context).toEqual({})
  expect(recognizedCommands.add_clip.processFn).toHaveBeenCalledWith(
    ['"Big Buck Bunny.mp4"', "0", "10"],
    context,
    mockWorkingContext
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
  executeCommand(
    {
      command: "add_custom_element",
      args: [
        "\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\"",
        "30",
        "35",
      ],
    },
    recognizedCommands as any,
    context,
    mockWorkingContext
  )

  expect(context).toEqual({})
  expect(recognizedCommands.add_custom_element.processFn).toHaveBeenCalledWith(
    [
      "\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\"",
      "30",
      "35",
    ],
    context,
    mockWorkingContext
  )
})
