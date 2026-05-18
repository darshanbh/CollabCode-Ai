const axios = require('axios');

const generateAgent = async (description, language) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a Code Generation Agent. Write clean working ${language} code based on descriptions only. Return code only, no explanations.`
        },
        {
          role: 'user',
          content: `Write ${language} code for: ${description}`
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

module.exports = generateAgent;