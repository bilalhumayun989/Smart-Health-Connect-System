const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

console.log('OPENAI_API_KEY Loaded:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.slice(0, 10) : 'missing');

router.post('/', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ answer: 'No query provided' });
  }

  if (!openai) {
    return res.json({
      answer: 'AI chatbot is currently using a placeholder configuration. Add a real OPENAI_API_KEY to enable live responses.'
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query },
      ],
    });

    const text = completion.choices[0].message.content;
    res.json({ answer: text });
  } catch (err) {
    console.error('OpenAI API Error:', err);
    res.status(500).json({ answer: 'Failed to get response from OpenAI.' });
  }
});

module.exports = router;
