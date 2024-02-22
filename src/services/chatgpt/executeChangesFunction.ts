export default {
  type: "function",
  function: {
    name: "execute_changes",
    parameters: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description:
            'The script that executes the commands. e.g. move("12964663", 4);\nclip_id = add_clip("Clip #2", 2);\ncrop(clip_id, 0, 2);',
        },
        explanation: {
          type: "string",
          description:
            'Explanation of the changes made by the script. Use passive tense. When referring to a clip, use its name. e.g. "The clip "Clip #1" is moved to the 4th second of the video, then the first 2 seconds of "Clip #2" is added at the 2nd second."',
        },
      },
      required: ["script", "explanation"],
    },
    description: "Execute the changes on the video",
  },
} as const
