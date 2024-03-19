const removeExtension = (filename: string): string =>
  filename.split(".").slice(0, -1).join(".")

export default removeExtension
