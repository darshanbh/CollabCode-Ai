const orchestrator = require('../agents/orchestrator');

exports.aiAssist = async (req, res) => {
  const { code, action, language, description } = req.body;
  try {
    const result = await orchestrator(code, action, language, description);
    res.json({ result });
  } catch (err) {
    console.log('AGENT ERROR:', err.message);
    res.status(500).json({ message: 'Agent failed', error: err.message });
  }
};
