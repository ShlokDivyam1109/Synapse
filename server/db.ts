import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectDB() {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error("MONGODB_URI missing");
      return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      });
    })().catch((err) => {
      // Don't cache a permanently-failed connection attempt — let the next
      // request try again (e.g. a transient Atlas hiccup shouldn't wedge
      // every subsequent request in this warm container forever).
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}
