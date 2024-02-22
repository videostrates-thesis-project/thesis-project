interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext
  ) => ReturnValue | undefined | void
}

export type RecognizedCommands = {
  [key: string]: CommandProperties
}
