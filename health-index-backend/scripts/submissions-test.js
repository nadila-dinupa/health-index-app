const axios = require('axios');

const loginUrl = 'http://localhost:5000/api/login';
const subsUrl = 'http://localhost:5000/api/submissions';

(async () => {
  try {
    const login = await axios.post(loginUrl, { username: 'admin', password: 'securepassword123' });
    console.log('Login status:', login.status);
    const token = login.data.token;
    console.log('Token length:', token ? token.length : 0);

    const res = await axios.get(subsUrl, { headers: { Authorization: `Bearer ${token}` } });
    console.log('/api/submissions status:', res.status);
    console.log('Body length:', Array.isArray(res.data) ? res.data.length : typeof res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response error status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else if (err.request) {
      console.error('No response received. Is backend running?');
      console.error(err.message);
    } else {
      console.error('Request error:', err.message);
    }
  }
})();
