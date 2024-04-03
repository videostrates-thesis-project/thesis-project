// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const print = (...data: any[]) => {
  const returnFn = () => {
    console.log(...data)
  }

  returnFn.toString = () => `print(${data.join(", ")})`
  return returnFn
}
