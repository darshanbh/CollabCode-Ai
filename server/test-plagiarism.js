const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ROOM_ID = 'C6E6937A'; // paste any roomId from your DB

async function test() {

  // Step 1: Login
  console.log('Logging in...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'darshanbh8@gmail.com',      // your teacher account email
    password: '123456'       // your password
  });

  const token = loginRes.data.token;
  console.log('Token received ✓');

  // Step 2: Hit plagiarism route
  console.log('Checking plagiarism for room:', ROOM_ID);
  const res = await axios.get(`${BASE_URL}/plagiarism/${ROOM_ID}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Step 3: Print results
  console.log('\n=== CLASS AVERAGE ===', res.data.classAverage + '%');
  console.log('\n=== RESULTS ===');
  res.data.results.forEach(r => {
    console.log(`
    ${r.studentA} vs ${r.studentB}
    Similarity  : ${r.similarity}%
    Deviation   : ${r.deviation}%
    Paste A     : ${r.pasteEventsA}
    Paste B     : ${r.pasteEventsB}
    Verdict     : ${r.verdict}
    Note        : ${r.note}
    `);
  });
}

test().catch(err => {
  console.error('Error:', err.response?.data || err.message);
});