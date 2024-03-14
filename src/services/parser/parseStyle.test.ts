import { parseStyle } from "./parseStyle"

test("can parse style", () => {
  const style = parseStyle(`.test { color: red; }`)

  expect(style.style).toEqual([
    {
      selector: ".test",
      style: "color: red;",
    },
    {
      selector: "div video",
      style: "position: relative !important;",
    },
  ])
})

test("can parse multiple styles", () => {
  const style = parseStyle(`.test { color: red; } .test2 { color: blue; }`)

  expect(style.style).toEqual([
    {
      selector: ".test",
      style: "color: red;",
    },
    {
      selector: ".test2",
      style: "color: blue;",
    },
    {
      selector: "div video",
      style: "position: relative !important;",
    },
  ])
})

test("can parse complex selectors", () => {
  const style = parseStyle(`.test, .test2 { color: red; }`)

  expect(style.style).toEqual([
    {
      selector: ".test, .test2",
      style: "color: red;",
    },
    {
      selector: "div video",
      style: "position: relative !important;",
    },
  ])
})

test("can parse nested selectors", () => {
  const style = parseStyle(`.test { color: red; .test2 { color: blue; } }`)

  expect(style.style).toEqual([
    {
      selector: ".test",
      style: "color: red; .test2 { color: blue; }",
    },
    {
      selector: "div video",
      style: "position: relative !important;",
    },
  ])
})

test("can parse animations", () => {
  const style = parseStyle(
    `@keyframes test { 0% { color: red; } 100% { color: blue; } }`
  )

  expect(style.animations).toEqual([
    {
      selector: "test",
      style: "0% { color: red; } 100% { color: blue; }",
    },
  ])
})

test("can parse both styles and animations", () => {
  const style = parseStyle(
    `.test { color: red; } @keyframes test { 0% { color: red; } 100% { color: blue; } }`
  )

  expect(style.style).toEqual([
    {
      selector: ".test",
      style: "color: red;",
    },
    {
      selector: "div video",
      style: "position: relative !important;",
    },
  ])
  expect(style.animations).toEqual([
    {
      selector: "test",
      style: "0% { color: red; } 100% { color: blue; }",
    },
  ])
})
