import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  const useMemory = process.env.USE_MEMORY_DB === 'true';
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management';

  if (useMemory) {
    try {
      console.log('⚡ Starting in-memory MongoDB server for development/testing...');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error('❌ Failed to start in-memory MongoDB:', err.message);
      process.exit(1);
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Direct MongoDB connection failed (${error.message}). Falling back to In-Memory MongoDB...`);
    try {
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Fallback In-Memory MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (memError) {
      console.error('❌ MongoDB Connection Fatal Error:', memError.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
