const axios = require('axios');

async function test() {
  try {
    // 1. Register a test user
    const userRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'TestUser',
      email: 'testuser@test.com',
      password: 'password123'
    });
    const token = userRes.data.token;
    console.log("Token:", token);

    // 2. Run code
    const runRes = await axios.post('http://localhost:5000/api/code/run', {
      code: 'console.log("Hello from test");',
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Run response:", runRes.data);
  } catch (err) {
    console.error("Test failed:", err.response ? err.response.data : err.message);
  }
}
test();
