// Force DNS servers for Node's resolver to rule out local DNS issues
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');

const buildUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST || 'cluster0.fam36iz.mongodb.net';
  const db = process.env.MONGO_DB || '';
  if (user && pass) {
    return `mongodb+srv://${user}:${encodeURIComponent(pass)}@${host}/${db}?retryWrites=true&w=majority`;
  }
  return null;
};

const uri = buildUri();
const masked = uri ? uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+):[^@]+@/, '$1:*****@') : 'no uri';
console.log('Test script using:', masked);

if (!uri) {
  console.error('No Mongo URI available. Set MONGO_URI or MONGO_USER & MONGO_PASS in .env');
  process.exit(2);
}

mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully (test script).');
    return mongoose.disconnect().then(() => process.exit(0));
  })
  .catch(err => {
    if (err && err.codeName) {
      console.error('Connection error (test script):', err.codeName + ':', err.message);
    } else {
      console.error('Connection error (test script):', err && err.message ? err.message : err);
    }
    process.exit(1);
  });
