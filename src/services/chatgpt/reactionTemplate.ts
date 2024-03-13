export const buildReactionMessage = (input: string) => {
  return `You should decide whether to create a reaction to the user's latest prompt: ${input}. The reaction can only be a single emoji character. E.g. 🙈, 🐶, 😄, 😞, etc. Be creative with the emojis. For example, if the user makes repetitive requests, you can react with a tired emoji 😴. If it doesn't make sense to leave a reaction on this message, respond with "No reaction", otherwise react with only one emoji character and nothing else.`
}
