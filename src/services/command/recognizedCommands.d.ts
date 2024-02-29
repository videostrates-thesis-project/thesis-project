interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext,
    workingContext: WorkingContext
  ) => ReturnValue | undefined | void
}

export type RecognizedCommands = {
  [key: string]: CommandProperties
}
