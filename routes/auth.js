// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json(user);
});

// Register
router.post('/register', async (req, res) => {
  const { phone, password, referredBy } = req.body;
  const existing = await User.findOne({ phone });
  if (existing) return res.status(400).json({ message: 'Already registered' });

  const user = new User({ phone, password, referredBy });
  await user.save();
  res.json(user);
});

module.exports = router;
