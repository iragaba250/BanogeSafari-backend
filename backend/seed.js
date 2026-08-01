import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Setting from './models/Setting.js';
import { aboutDefaults } from '../frontend/src/pages/aboutDefaults.js';
import { contactDefaults } from '../frontend/src/pages/contactDefaults.js';
import { siteDefaults } from '../frontend/src/siteDefaults.js';

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});

    await User.create({
      name: 'Admin',
      email: 'admin@banoge.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
    });

    await Setting.deleteMany({});
    await Setting.create({
      key: 'heroImages',
      value: [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=80',
      ],
    });

    await Setting.create({
      key: 'about',
      value: aboutDefaults,
    });

    await Setting.create({
      key: 'contact',
      value: contactDefaults,
    });

    await Setting.create({
      key: 'site',
      value: siteDefaults,
    });

    console.log('Database seeded successfully!');
    console.log('Admin: admin@banoge.com / admin123');
    console.log('User:  john@example.com / password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
