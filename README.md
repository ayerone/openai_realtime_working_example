# openai_realtime_working_example
A basic working example of using OpenAI's realtime API to save you from having to pull your hair out.

# Purpose
The OpenAI realtime API exposes a great platform for creating speach-to-speech apps with low latency, which makes conversations with the AI feel more natural.  If you have tried to get started with this API, you might have found (a lot of developers have) that there are some...issues with OpenAI's documentation.  This project aims to be a bare-bones example of how to use the API to get you up and running, without the headaches. We have attempted to make this project accessible to entry-level developers with very little experience.

# Stack
The project uses HTML, plain javascript, and nodejs (version 22) to run a local server, which:
* hosts static files (index.html and index.js) which you can access from your browser
* provides an endpoint for getting an "ephemeral" key from OpenAI's servers for use by the realtime session (This arrangement allows the client (browser) to access the realtime API while keeping your real API key safe on your local server)
Note: The server's sole dependency is express.js

# Set Up
* Create an enviornment variable in your system (where the server will run) to store your OpenAI API key.  The variable should be called OPENAI_API_KEY (because that is how it is referenced in server.js)
* Install nodejs and npm (node package manager) on your system.  I used node version 22 at time of writing, October 2025
* Clone this repository locally and enter that directory.
* Install node dependencies:
```
npm install
```
Note: this will install express since it is listed as a project requirement in package.json

# Run
* Start the server in a terminal:
```
node server.js
```
* Note the port, which is set to 3000
* Open a browser and navigate to localhost:3000/index.html
* Talk to the model!
