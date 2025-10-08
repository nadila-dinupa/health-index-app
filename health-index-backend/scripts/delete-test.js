const axios = require('axios');
const id = process.argv[2];
if (!id) { console.error('Usage: node delete-test.js <id>'); process.exit(2); }
const token = ''; // optionally paste token here or get one via login
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/login', { username: 'admin', password: 'securepassword123' });
    const t = login.data.token;
    const res = await axios.delete(`http://localhost:5000/api/submissions/${id}`, { headers: { Authorization: `Bearer ${t}` } });
    console.log('Delete status:', res.status, res.data);
  } catch (err) {
    if (err.response) console.error('Error status:', err.response.status, err.response.data);
    else console.error('Request error:', err.message);
  }
})();
