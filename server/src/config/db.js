import dns from 'dns';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
