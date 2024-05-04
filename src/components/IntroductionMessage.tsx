const welcomeMessageString = `Hello! I'm an AI assistant designed to help you with video editing tasks. 
I can:
- add or edit clips and other elements,
- modify HTML code of custom elements, 
- generate images
- access the library of reusable elements and the current playhead position
- see what is currently selected in the library, the timeline or the chat. The selection will be marked with magical sparkles!

Unfortunately, I don't have access to searching in clips transcript yet.

Feel free to ask me anything!
`

const IntroductionMessage = () => {
  return (
    <div className="chat pb-4 pl-4 chat-start">
      <div className="flex justify-center items-center">
        <div className="chat-bubble text-left break-normal text-sm relative pb-4 whitespace-pre-line">
          <div className="absolute w-full h-full top-0 left-0 rounded-2xl pointer-events-none border-0"></div>
          {welcomeMessageString}
        </div>
      </div>
    </div>
  )
}

export default IntroductionMessage
