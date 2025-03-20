require("dotenv").config(); // for connect .env
const express = require("express");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = 3000;

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route to handle form submission
app.post("/generate", async (req, res) => {
  try {
    const inputText = req.body.input_text;

    if (!inputText || inputText.trim().length === 0) {
      return res.status(400).json({ error: "Input text is required" });
    }

    // Use Gemini API to generate hashtags and quotes
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate 2 short quotes and 10 hashtags for an Instagram post based on the following text:\n\n${inputText}\n\nFormat the response as follows:\nQuotes:\n1. [Quote 1]\n2. [Quote 2]\n\nHashtags:\n#hashtag1 #hashtag2 ...`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse the generated text into quotes and hashtags
    const quotes = generatedText
      .split("Quotes:")[1]
      .split("Hashtags:")[0]
      .trim()
      .split("\n")
      .map((line) => line.trim());
    const hashtags = generatedText
      .split("Hashtags:")[1]
      .trim()
      .split(" ")
      .map((tag) => tag.trim());

    res.json({ quotes, hashtags });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});