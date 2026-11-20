import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
    console.log('Usage: node scripts/createAdmin.js "Full Name" email@example.com password');
    process.exit(1);
}

const run = async () => {
    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
        existing.role = 'admin';
        await existing.save();
        console.log(`Existing user ${email} promoted to admin.`);
    } else {
        await User.create({ name, email, password, role: 'admin' });
        console.log(`Admin account created for ${email}.`);
    }

    await mongoose.disconnect();
    process.exit(0);
};

run();
