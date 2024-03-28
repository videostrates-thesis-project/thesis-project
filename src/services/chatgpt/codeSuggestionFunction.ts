export type CodeSuggestionsFunction = {
  html: string
  css: string
  explanation: string
}

export default {
  type: "function",
  function: {
    name: "code_suggestions",
    description: "Suggest changes to the HTML and CSS",
    parameters: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description:
            "The HTML code for this element. The code should be complete, including all previous changes and content. The code should contain IDs for all elements. Do not skip any parts of the input HTML in your response. Always return the entire code, even the unchanged parts.",
        },
        css: {
          type: "string",
          description:
            "The CSS code for this element. Do not use inline styles or IDs. Always return the entire code, even the unchanged parts.",
        },
        explanation: {
          type: "string",
          description:
            "Answer to the user's request. The explanation should be a single sentence that explains what was changed in the input. In the next two sentences, provide an explanation of how the generated code works. The explanation should be clear and concise.",
        },
      },
      required: ["html", "css", "explanation"],
    },
  },
}
