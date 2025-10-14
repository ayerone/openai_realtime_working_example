
// Note: your environment needs to have OPENAI_API_KEY

const express = require('express');

const app = express();
app.use(express.json());

// Serve static files from the src directory (index.html, index.js, assets)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/realtime_session_key', async (req, res) => {
    console.log("requesting ephemeral key from openai");
    const sessionConfig = JSON.stringify({
        session: {
            type: "realtime",
            model: "gpt-realtime-mini-2025-10-06",
            instructions: "You always respond in haiku.", // You should probably change this!
            // this "audio" property is only needed if you want to receive text transcripts of what the user says
            audio: {
                input: {
                    transcription: {
                        model: "gpt-4o-mini-transcribe",
                    },
                },
            },
        },
    });
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: sessionConfig,
    });
    const data = await response.json();
    console.log("OpenAI client_secret response:", data);
    // console.log("got key:", data.value); // e.g. ek_68af296e8e408191a1120ab6383263c2
    res.status(200).send(data.value);
});

const port = 3000;
app.listen(port, () => {
    console.log("Server listening on port", port);
});
