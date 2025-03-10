const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/placementDB");
    console.log("MongoDB connected successfully! ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
