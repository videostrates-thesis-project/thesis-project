const formatTime = (seconds: number) => {
  const date = new Date(0)
  date.setSeconds(seconds)
  let formattedTime = date.toISOString().substring(11, 19)
  if (formattedTime.startsWith("00:")) {
    formattedTime = formattedTime.substring(3)
  }
  return formattedTime
}

export default formatTime
