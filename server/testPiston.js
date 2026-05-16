const axios = require('axios');

axios.post('https://emkc.org/api/v2/piston/execute', {
  language: 'python',
  version: '3.10.0',
  files: [{ content: 'print("Hello World")' }]
}, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}).then(r => {
  console.log('Full response:', JSON.stringify(r.data, null, 2));
}).catch(e => {
  console.log('Error status:', e.response?.status);
  console.log('Error data:', e.response?.data);
  console.log('Error message:', e.message);
});