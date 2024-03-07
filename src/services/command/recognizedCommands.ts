import { ExecutionContext } from "./executionContext"
import { ReturnValue } from "./returnValue"

interface CommandProperties {
  processFn: (
    args: string[],
    context: ExecutionContext,
    returnVariableName?: string
  ) => ReturnValue | undefined | void
}

export const availableCommands = [
  "move",
  "add_clip",
  "delete_element",
  "crop",
  "move_delta",
  "add_custom_element",
  "create_style",
  "delete_style",
  "assign_class",
  "create_animation",
  "delete_animation",
  "set_speed",
  "add_subtitle",
  "rename_element",
  "add_clip_to_element",
] as const

export type AvailableCommand = (typeof availableCommands)[number]

export type RecognizedCommands = {
  [key in AvailableCommand]: CommandProperties
}

export interface ExecutableCommand {
  command: AvailableCommand
  args: string[]
  variable?: string | null
}
