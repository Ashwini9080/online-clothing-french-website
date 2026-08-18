import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const MONGO_URI =
  process.env.MONGO_PRIVATE_URL ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/lumiere-studio';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable, using in-memory auth store for local development:', (error as Error).message);
  }
};
