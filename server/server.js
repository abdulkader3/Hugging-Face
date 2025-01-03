require('dotenv').config();

// Check if API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('No OpenAI API key found in environment variables');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: req.body.messages,
      temperature: 0.7,
      max_tokens: 150
    });
    res.json(response.choices[0].message);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(error.status || 500).json({ 
      error: error.message 
    });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API Key is present and has length:', process.env.OPENAI_API_KEY.length);
}); 