export const buildCodeMessage = (
  html: string,
  css: string,
  position?: { lineNumber: number; column: number },
  highlighted?: string | null
) => {
  return (
    input: string
  ) => `Based on the following html code: ${html}, and css code: ${css} suggest a way of making the following changes: ${input}.
    When making style changes, ALWAYS use CSS classes and other selectors. NEVER use inline styles or IDs.
    Make ONLY the changes the user asked for above.
      ${
        highlighted && position
          ? `The change should be made around line number ${position.lineNumber}, column ${position.column}, near ${highlighted}. Your change should ONLY affect this part of the code. DO NOT use inline styles for styling, ONLY classes.`
          : ""
      }
      Reply in the following JSON format: {html: "...", "css": "..." "explanation": "..."},
      where the "html" field should contain suggested HTML code generated and the "explanation" field should contain an explanation for what was changed in one sentence from the input. The next two sentences should explain how the code works. The explanation should be concise and to the point.
      The "html" field should contain the entire HTML code of the website, including ALL previous content and changes AND the current changes. UNDER NO CIRCUMSTANCES should you skip any parts of the input HTML in your response.
      The "css" field should contain the entire CSS code of the website, including ALL previous content and changes AND the current changes. UNDER NO CIRCUMSTANCES should you skip any parts of the input CSS in your response.
      Always return the entire code, even the unchanged parts.`
}
