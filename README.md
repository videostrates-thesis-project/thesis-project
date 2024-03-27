# Artificial Intelligence-assisted Video Editor
This repository contains a prototype implementation for a master's thesis for Aarhus University, Department of Computer Science.
The thesis topic is designing and implementing an artificial intelligence-assisted video editor powered by human-centred generative AI to support less-experienced users. The editor utilizes the [Videostrates](https://videostrates.projects.cavi.au.dk/) toolkit, built on the [Webstrates](https://webstrates.net/) platform. The editor implements a timeline with basic video editing features such as moving and trimming clips. Furthermore, it provides an AI assistant, which allows the user to edit the video using natural language commands, and taking advantage of the Videostrates capabilities, it can generate custom HTML/CSS elements. Ensuring a human-centred approach, the assistant provides a text explanation of its actions, with a visualization of the changes on the timeline, and the user's confirmation is required before applying them. 

![screenshot](./screenshot.jpg)


## Implementation
The video editor is implemented in React. The edited video is stored as a Videostrate, which utilizes HTML, CSS, and JavaScript to create video compositions. The video preview is displayed using an iframe with a Videostrates player implemented in a webstrate. The player uses server-side rendering for improved performance on weaker devices. The AI assistant has access to an HTML/CSS representation of the Videostrate state, similar to the original state, but with modified attributes to improve the AI's understanding of the video content. The assistant uses OpenAI's GPT-4 Turbo in a function calling mode to generate responses to the user's requests. The assistant does not have direct control of modifying the videostrate code but is instead instructed to generate a domain-specific script, which includes commands for making modifications to the original Videostrates code. This custom language provides better control over the AI assistant's actions along with a structured way of making changes in the video and visualizing them. The generated response contains the script and a user-friendly explanation of the changes.

Due to the web-based nature of Videostrates, the AI assistant can generate and add custom HTML/CSS elements to the videostrate, and following reification and reuse principles, the user can save these elements and reuse them later. Moreover, the AI assistant can access OpenAI's DALL-E 3 model to generate images. All custom elements (including images) can be edited in the embedded HTML/CSS editor providing code auto-completion with GPT-3.5 Turbo and a separate AI assistant.

Furthermore, the AI assistant may react with an emoji to the user's message, providing a more human-like interaction.


## Tech Stack
- React (Typescript, Zustand, TailwindCSS, DaisyUI)
- Webstrates
- Videostrates
- OpenAI (GPT-4 Turbo, GPT-3.5 Turbo, DALL-E 3)
- Firebase


## Development

### Environment Variables
Required environment variables are specified in `.env.example`. Copy this file to `.env` and fill in the values.

### Running the Application
- Start backend - [videostrates-thesis-project/thesis-backend](https://github.com/videostrates-thesis-project/thesis-backend)
- Install NodeJS and NPM from [NodeJS](https://nodejs.org/en). Any recent(ish) release should work.
- Install dependencies by running `npm install`.
- Start the application in development mode by running `npm run dev`.

### IDE
Suggested development environment is Visual Studio Code with extensions specified in `.vscode/extensions.json`. The workspace is configured to use ESLint and Stylelint both for linting and formatting on save.
