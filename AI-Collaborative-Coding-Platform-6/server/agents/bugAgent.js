const axios = require('axios');

const bugAgent = async (code) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a Bug Detection Agent. Only find bugs in code. List each bug with line number clearly.'
        },
        {
          role: 'user',
          content: `Find all bugs in this code:\n\n${code}`
        }
      ],
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
};

module.exports = bugAgent;