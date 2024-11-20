import mongoose, { Schema, model } from "mongoose";
import { MONGO_URL } from "./config";


// Connect to MongoDB
mongoose.connect(MONGO_URL);

// Define User Schema
const userSchema = new Schema({
  username: { type: String, unique: true, required: true }, // Added `required`
  password: { type: String, required: true },
});

// Define Content Schema
const contentSchema = new Schema({
  title: { type: String, required: true },
  password: { type: String, required: true },
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

// Models
export const UserModel = model("User", userSchema);
export const ContentModel = model("Content", contentSchema);
