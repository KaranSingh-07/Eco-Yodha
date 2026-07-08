import jwt from 'jsonwebtoken';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// We need a valid user ID. Let's find one.
import mongoose from 'mongoose';
import User from '../models/User.js';

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ role: 'student' });
  if (!user) {
    console.log("No student user found");
    process.exit(1);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/modules',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log("Status:", res.statusCode);
      const modules = JSON.parse(data);
      console.log("Modules:");
      modules.forEach(m => console.log(`${m.title} - ${m.status}`));
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
  });

  req.end();
};

test();
