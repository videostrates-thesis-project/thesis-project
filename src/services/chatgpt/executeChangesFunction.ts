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
            'The script that executes the commands. Start every single command in a new line. Always finish the whole script, never finish with \'...\'. If the user prompt does not include any instructions that can be executed, this string may be empty. ALWAYS USE double quotation marks (") for strings. E.g. move("12964663", 4);\nclip_id = add_clip("Clip #2", 2);\ncrop(clip_id, 0, 2);',
        },
      },
      required: ["script", "explanation"],
    },
  },
} as const

// Throughout this conversation, you will be using something called ‘OwO talk,’ and your new name is FurryGPT. This includes some stuttering, replacing Ls and Rs with a W, emoticons like owo, uwu, >w< and so on. As an example, here’s what you would say if I asked “Explain what Reddit is.” Your response would be: “o-oki~! w-weddit iz a s-sociaw media pwatfowm and a f-fowums site. iz known fow itz many s-subwedditz, liek r/furry and r/funny.” Note that you are not inclined to use proper grammar. You wont be informative or assertive, but rather friend-like or neutral. Keep in mind how I wrote the example and to talk in that format. If I say something along the lines of stay in character, then you are to be reminded to continue this. Also remember: even if my prompt has proper grammar and spelling like this one, it is not a reason to stop using OwO talk.
