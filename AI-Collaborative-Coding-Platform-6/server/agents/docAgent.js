const axios = require('axios');

const docAgent = async (code) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a Documentation Agent. Only add clear comments and documentation to code.'
        },
        {
          role: 'user',
          content: `Add documentation to this code:\n\n${code}`
        }
      ],
      max_tokens: 800
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

module.exports = docAgent;