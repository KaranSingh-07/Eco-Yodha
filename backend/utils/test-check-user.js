import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUser = async () => {
  try {
    console.log('Connecting to DB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const emailToSearch = 'kaddu@gmail.com';
    const user = await User.findOne({ email: emailToSearch });
    if (user) {
      console.log('FOUND USER:', user);
    } else {
      console.log(`NO USER found with email: ${emailToSearch}`);
      const allUsers = await User.find({}, 'name email role classApproved');
      console.log('ALL USERS in DB:', allUsers);
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
};

checkUser();
