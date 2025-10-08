const axios = require('axios');

const loginUrl = 'http://localhost:5000/api/login';
const meUrl = 'http://localhost:5000/api/me';

const credentials = { username: 'admin', password: 'securepassword123' };

(async () => {
  try {
    const loginRes = await axios.post(loginUrl, credentials);
    console.log('Login status:', loginRes.status);
    const token = loginRes.data.token;
    console.log('Token:', token);

    const meRes = await axios.get(meUrl, { headers: { Authorization: `Bearer ${token}` } });
    console.log('/api/me response:', meRes.status, meRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
  }
})();
