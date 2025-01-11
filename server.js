require('dotenv').config();
const express = require('express');
const multer = require('multer');
const openai = require('openai');
const fs = require('fs');

const app = express();
const upload = multer();
const port = 5000;

openai.apiKey = process.env.OPENAI_API_KEY;

app.use(express.static('frontend'));

app.post('/chat', upload.single('audio'), async (req, res) => {
    try {
        const audioBuffer = req.file.buffer;
        const audioBase64 = audioBuffer.toString('base64');

        const response = await openai.audio.transcribe({
            model: "whisper-1",
            audio: audioBase64
        });

        const userText = response.text;

        const chatResponse = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: userText }]
        });

        const aiText = chatResponse.choices[0].message.content;

        const ttsResponse = await openai.audio.create({
            model: "tts-1",
            input: aiText,
            voice: "alloy"
        });

        res.json({ text: aiText, audio: ttsResponse.audio });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error processing the audio");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 