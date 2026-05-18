const axios = require('axios');

const languageMap = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  python: { language: 'python3', versionIndex: '4' },
  java: { language: 'java', versionIndex: '4' },
  c: { language: 'c', versionIndex: '5' }
};

exports.runCode = async (req, res) => {
  const { code, language } = req.body;
  console.log("🚀 RUN CODE REQUEST:", { language, codeLength: code?.length });
  const langConfig = languageMap[language] || languageMap.javascript;

  try {
    const response = await axios.post(
      'https://api.jdoodle.com/v1/execute',
      {
        script: code,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log("JDOODLE RESPONSE:", response.data);

    res.json({
      output: response.data.output || 'No output',
      status: response.data.statusCode === 200 ? 'Success' : 'Error'
    });

  } catch (err) {
    console.log('CODE RUN ERROR:', err.message);
    res.status(500).json({
      message: 'Code execution failed',
      error: err.message
    });
  }
};