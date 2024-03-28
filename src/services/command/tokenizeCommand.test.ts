import { tokenizeCommand } from "./tokenizeCommand"
import "@testing-library/jest-dom"

test("can tokenize", () => {
  const { command, args, variable } = tokenizeCommand(
    'add_clip("Big Buck Bunny.mp4", 0, 10)'
  )

  expect(command).toBe("add_clip")
  expect(args).toEqual(['"Big Buck Bunny.mp4"', "0", "10"])
  expect(variable).toBe(null)
})

test("can tokenize with variable", () => {
  const { command, args, variable } = tokenizeCommand(
    'clip_id = add_clip("Big Buck Bunny.mp4", 0, 10)'
  )

  expect(command).toBe("add_clip")
  expect(args).toEqual(['"Big Buck Bunny.mp4"', "0", "10"])
  expect(variable).toBe("clip_id")
})

test("can't tokenize without parentheses", () => {
  expect(() => tokenizeCommand("clip_id = add_clip")).toThrow(Error)
})

test("can tokenize string with quotes inside", () => {
  const { command, args, variable } = tokenizeCommand(
    'add_custom_element("<div class=\\"test\\"></div>")'
  )

  expect(command).toBe("add_custom_element")
  expect(args).toEqual(['"<div class=\\"test\\"></div>"'])
  expect(variable).toBe(null)
})

test("can tokenize string with commas inside", () => {
  const { command, args, variable } = tokenizeCommand(
    'add_custom_element("<div class=\\"test\\", id=\\"test\\"></div>")'
  )

  expect(command).toBe("add_custom_element")
  expect(args).toEqual(['"<div class=\\"test\\", id=\\"test\\"></div>"'])
  expect(variable).toBe(null)
})

test("can tokenize html string", () => {
  const { command, args, variable } = tokenizeCommand(
    "add_custom_element(\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\", 30, 35)"
  )

  expect(command).toBe("add_custom_element")
  expect(args).toEqual([
    "\"<div style='color: red; font-size: 24px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);'>ChatGPT is cool!</div>\"",
    "30",
    "35",
  ])
  expect(variable).toBe(null)
})

test("can tokenize complex element", () => {
  const { command, args, variable } = tokenizeCommand(
    `table_id = add_custom_element("<table class=\\"dinosaur-table jumping\\"><tr><th>Name</th><th>Period</th><th>Diet</th></tr><tr><td>Tyrannosaurus</td><td>Late Cretaceous</td><td>Carnivore</td></tr><tr><td>Stegosaurus</td><td>Late Jurassic</td><td>Herbivore</td></tr><tr><td>Velociraptor</td><td>Late Cretaceous</td><td>Carnivore</td></tr></table>", 20, 25);`
  )

  expect(command).toBe("add_custom_element")
  expect(args).toEqual([
    `"<table class=\\"dinosaur-table jumping\\"><tr><th>Name</th><th>Period</th><th>Diet</th></tr><tr><td>Tyrannosaurus</td><td>Late Cretaceous</td><td>Carnivore</td></tr><tr><td>Stegosaurus</td><td>Late Jurassic</td><td>Herbivore</td></tr><tr><td>Velociraptor</td><td>Late Cretaceous</td><td>Carnivore</td></tr></table>"`,
    "20",
    "25",
  ])
  expect(variable).toBe("table_id")
})

test("can tokenize array", () => {
  const { command, args, variable } = tokenizeCommand(
    'assign_class([clip_1_id, clip_2_id], "composition-class");'
  )

  expect(command).toBe("assign_class")
  expect(args).toEqual(["[clip_1_id, clip_2_id]", '"composition-class"'])
  expect(variable).toBe(null)
})

test("can tokenize single quotes", () => {
  const { command, args, variable } = tokenizeCommand(
    "assign_class([clip_1_id, clip_2_id], 'composition-class');"
  )

  expect(command).toBe("assign_class")
  expect(args).toEqual(["[clip_1_id, clip_2_id]", "'composition-class'"])
  expect(variable).toBe(null)
})
