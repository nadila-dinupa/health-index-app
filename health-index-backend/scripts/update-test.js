const axios = require('axios');
const id = process.argv[2];
if (!id) { console.error('Usage: node update-test.js <id>'); process.exit(2); }
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/login', { username: 'admin', password: 'securepassword123' });
    const t = login.data.token;
    // minimal update payload
    const payload = { companyName: 'UPDATED_COMPANY' };
    const res = await axios.put(`http://localhost:5000/api/submissions/${id}`, payload, { headers: { Authorization: `Bearer ${t}` } });
    console.log('Update status:', res.status, res.data);
  } catch (err) {
    if (err.response) console.error('Error status:', err.response.status, err.response.data);
    else console.error('Request error:', err.message);
  }
})();
