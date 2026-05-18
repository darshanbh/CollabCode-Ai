const bugAgent = require('./bugAgent');
const reviewAgent = require('./reviewAgent');
const optimizeAgent = require('./optimizeAgent');
const docAgent = require('./docAgent');
const generateAgent = require('./generateAgent');

const orchestrator = async (code, action, language, description) => {
  if (action === 'all') {
    const [bugs, review, optimization, documentation] =
      await Promise.all([
        bugAgent(code),
        reviewAgent(code),
        optimizeAgent(code),
        docAgent(code)
      ]);
    return { bugs, review, optimization, documentation };
  }
  if (action === 'bug')      return { bugs: await bugAgent(code) };
  if (action === 'review')   return { review: await reviewAgent(code) };
  if (action === 'optimize') return { optimization: await optimizeAgent(code) };
  if (action === 'document') return { documentation: await docAgent(code) };
  if (action === 'generate') return { generated: await generateAgent(description, language) };
};

module.exports = orchestrator;