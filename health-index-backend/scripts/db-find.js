require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('../models/Submission');

const buildUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGO_USER && process.env.MONGO_PASS) {
    const user = process.env.MONGO_USER;
    const pass = encodeURIComponent(process.env.MONGO_PASS);
    const host = process.env.MONGO_HOST || 'cluster0.fam36iz.mongodb.net';
    const db = process.env.MONGO_DB || '';
    return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
  }
  return 'mongodb://localhost:27017/healthindex';
};

(async () => {
  const uri = buildUri();
  console.log('Connecting to', uri.replace(/([^:]+:\/\/[^:]+):[^@]+@/, '$1:*****@'));
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    const docs = await Submission.find().limit(5).lean();
    console.log('Found', docs.length, 'documents');
    if (docs.length) console.dir(docs, { depth: 2 });
    await mongoose.disconnect();
  } catch (err) {
    console.error('DB test error:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(2);
  }
})();
