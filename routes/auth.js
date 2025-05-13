const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Signup route
router.post("/signup", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.json({ success: false, message: "Phone already registered" });
    }

    const newUser = new User({ phone, password });
    await newUser.save();

    return res.json({ success: true, message: "Signup successful" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user || user.password !== password) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    return res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
