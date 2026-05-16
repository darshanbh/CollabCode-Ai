const axios = require('axios');
async function test() {
  const token = (await axios.post('http://localhost:5000/api/auth/register', { name: 'T2', email: 't2@test.com', password: 'p' })).data.token;
  
  const tests = [
    { code: 'print("py-test")', language: 'python' },
    { code: 'public class Main { public static void main(String[] args) { System.out.println("java-test"); } }', language: 'java' },
    { code: '#include <stdio.h>\nint main() { printf("c-test\\n"); return 0; }', language: 'c' }
  ];

  for (let t of tests) {
    try {
      const res = await axios.post('http://localhost:5000/api/code/run', t, { headers: { Authorization: `Bearer ${token}` } });
      console.log(`${t.language}:`, res.data);
    } catch (err) {
      console.error(`${t.language} failed:`, err.message);
    }
  }
}
test();
