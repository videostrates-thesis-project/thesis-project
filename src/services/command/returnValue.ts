export const acceptedReturnValueTypes = ["string", "number", "array"] as const
export type AcceptedReturnValue = (typeof acceptedReturnValueTypes)[number]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReturnValue<T = any> = {
  type: AcceptedReturnValue
  value: T
}
