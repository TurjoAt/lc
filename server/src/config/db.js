const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MongoDB connection string is not provided');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  });

  return mongoose.connection;
};

module.exports = { connectDB };
