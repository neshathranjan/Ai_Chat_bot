import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable not set.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("Gemini API Error:", errorData);
      return res.status(apiResponse.status).json({ error: `Gemini API error: ${errorData?.error?.message || apiResponse.statusText}` });
    }

    const data = await apiResponse.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({ error: "No valid reply from Gemini." });
    }

    res.json({ response: reply });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to communicate with Gemini API." });
  }
});

const PORT = process.env.PORT || 5000; // Changed default port to match frontend
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});