import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  password: String,
  wallet: { type: Number, default: 0 },
  referredBy: String,
  referrals: [String],
});

export default mongoose.model("User", userSchema);
