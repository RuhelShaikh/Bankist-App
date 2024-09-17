const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/userModel');
const URI = process.env.MONGODB_URI; // Make sure the path to the model is correct

//Seed function to populate the database
const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(URI);

    console.log('MongoDB Connected...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users removed');

    // Create hashed PIN for users
    const hashedPin1 = await bcrypt.hash('1234', 10);
    const hashedPin2 = await bcrypt.hash('5678', 10);

    // Demo user data with updated movements structure
    const users = [
      {
        username: 'JohnDoe',
        pin: hashedPin1,
        balance: 5000,
        movements: [
          { amount: 300, date: '2024-09-01T10:15:00Z' },
          { amount: -150, date: '2024-09-05T12:30:00Z' },
          { amount: 500, date: '2024-09-07T09:45:00Z' },
          { amount: -300, date: '2024-09-10T13:20:00Z' },
          { amount: 5000, date: '2024-09-15T09:30:00Z' },
          { amount: 1000, date: '2024-09-20T12:00:00Z' },
        ],
        interestRate: 1.2,
        currency: 'EUR',
        locale: 'en-GB',
        age: 30,
      },
      {
        username: 'JaneSmith',
        pin: hashedPin2,
        balance: 3000,
        movements: [
          { amount: 600, date: '2024-09-02T14:00:00Z' },
          { amount: -250, date: '2024-09-06T10:50:00Z' },
          { amount: 400, date: '2024-09-08T11:15:00Z' },
          { amount: -500, date: '2024-09-11T15:35:00Z' },
        ],
        interestRate: 1.5,
        currency: 'USD',
        locale: 'en-US',
        age: 28,
      },
    ];

    // Insert users into the database
    await User.insertMany(users);
    console.log('Demo users added to the database');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the seed function
seedDB();
