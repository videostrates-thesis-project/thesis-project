interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext,
    workingContext: WorkingContext,
    returnVariableName?: string
  ) => ReturnValue | undefined | void
}

export type RecognizedCommands = {
  [key: string]: CommandProperties
}
