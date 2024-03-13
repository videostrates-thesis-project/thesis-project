export default {
  type: "function",
  function: {
    name: "execute_changes",
    description: "Execute the changes on the video",
    parameters: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description:
            'The script that executes the commands. Always finish the whole script, newer write "..." in the end. If the user prompt does not include any instructions that can be executed, this string may be empty. e.g. move("12964663", 4);\nclip_id = add_clip("Clip #2", 2);\ncrop(clip_id, 0, 2);',
        },
        explanation: {
          type: "string",
          description:
            'Answer to the user\'s request. If changes were made, the structure should be:\n1. Confirmation, and suggesting that the changes are highlighted on the timeline.\n2. A list of the modifications.\n3. Letting the user know that they are welcome to ask for adjustments, or new modifications.\n\nIf changes were not made, respond accordingly. The html-code specifics should not be present in the answer, like ids and style names, etc. Clips should be referred to by their names.\nE.g., Certainly! You can see the suggested changes highlighted on the timeline. I have done the following:\n1. Moved the clip "Clip #1" to the 4th second of the video.\n2. Added the first 2 seconds of "Clip #2" at the 2nd second.\n\nLet me know if any adjustments are required.',
        },
      },
      required: ["script", "explanation"],
    },
  },
} as const
