import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI no definido");
    await mongoose.connect(uri, { dbName: process.env.MONGO_DBNAME || undefined });
    console.log("MongoDB conectado");
  } catch (err) {
    console.error("Error conectando Mongo:", err);
    process.exit(1);
  }
};

export default connectDB;

