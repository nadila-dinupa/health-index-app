const axios = require('axios');

const url = 'http://localhost:5000/api/login';
const credentials = { username: 'admin', password: 'securepassword123' };

axios.post(url, credentials)
  .then(res => {
    console.log('Status:', res.status);
    console.log('Body:', res.data);
  })
  .catch(err => {
    if (err.response) {
      console.error('Response error status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else if (err.request) {
      console.error('No response received. Is the backend running on port 5000?');
      console.error(err.message);
    } else {
      console.error('Request error:', err.message);
    }
  });
