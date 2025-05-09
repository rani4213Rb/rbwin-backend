const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  balance: { type: Number, default: 0 },
  vipLevel: { type: Number, default: 1 },
  referralCode: String,
  referredBy: String,
});

const User = mongoose.model('User', userSchema);

// Prediction Schema
const predictionSchema = new mongoose.Schema({
  userId: String,
  color: String,
  result: String,
  timestamp: { type: Date, default: Date.now },
});

const Prediction = mongoose.model('Prediction', predictionSchema);

// Transaction Schema (Withdraw/Recharge)
const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String, // 'withdraw' or 'recharge'
  amount: Number,
  method: String, // 'UPI', 'Paytm'
  status: String, // 'pending', 'completed', 'failed'
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('RBWIN Backend Running');
});

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const referralCode = `RBWIN${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const user = new User({ username, password: hashedPassword, referralCode });
  await user.save();
  res.json({ success: true, message: 'User registered' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, userId: user._id });
});

// Save Prediction
app.post('/api/predictions', authenticateToken, async (req, res) => {
  const { color } = req.body;
  const userId = req.user.userId;
  const colors = ['red', 'green', 'blue'];
  const result = colors[Math.floor(Math.random() * colors.length)];
  const prediction = new Prediction({ userId, color, result });
  await prediction.save();
  res.json({ success: true, result });
});

// Get Game History
app.get('/api/predictions/:userId', authenticateToken, async (req, res) => {
  const predictions = await Prediction.find({ userId: req.params.userId });
  res.json(predictions);
});

// Big/Small Game
app.post('/api/bigsmall', authenticateToken, async (req, res) => {
  const { option } = req.body;
  const number = Math.floor(Math.random() * 100) + 1;
  const result = number > 50 ? 'Big' : 'Small';
  res.json({ success: true, number, result });
});

// Dashboard Data
app.get('/api/dashboard/:userId', authenticateToken, async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ balance: user.balance, vipLevel: user.vipLevel });
});

// Recharge
app.post('/api/recharge', authenticateToken, async (req, res) => {
  const { amount, method } = req.body;
  const userId = req.user.userId;
  const transaction = new Transaction({ userId, type: 'recharge', amount, method, status: 'completed' });
  await transaction.save();
  await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
  res.json({ success: true, message: 'Recharge successful' });
});

// Withdraw
app.post('/api/withdraw', authenticateToken, async (req, res) => {
  const { amount, method } = req.body;
  const userId = req.user.userId;
  const user = await User.findById(userId);
  if (user.balance < amount) return res.status(400).json({ message: 'Insufficient balance' });

  const transaction = new Transaction({ userId, type: 'withdraw', amount, method, status: 'pending' });
  await transaction.save();
  await User.findByIdAndUpdate(userId, { $inc: { balance: -amount } });
  res.json({ success: true, message: 'Withdrawal request submitted' });
});

// Referral
app.post('/api/referral', authenticateToken, async (req, res) => {
  const { referralCode } = req.body;
  const userId = req.user.userId;
  const referrer = await User.findOne({ referralCode });
  if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });

  await User.findByIdAndUpdate(userId, { referredBy: referralCode });
  await User.findByIdAndUpdate(referrer._id, { $inc: { balance: 50 } }); // Reward referrer
  res.json({ success: true, message: 'Referral successful' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
