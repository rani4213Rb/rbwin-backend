const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
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
  winStreak: { type: Number, default: 0 }, // For WinStreak Bonus
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

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String, // 'withdraw' or 'recharge'
  amount: Number,
  method: String, // 'UPI'
  transactionId: String, // Add this field for recharge
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

// Real-Time Timer with WebSocket
let timer = 60;
setInterval(() => {
  timer = timer > 0 ? timer - 1 : 60;
  io.emit('timer', timer);
  if (timer === 0) {
    const colors = ['red', 'green', 'blue'];
    const result = colors[Math.floor(Math.random() * colors.length)];
    io.emit('result', result);
  }
}, 1000);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.get('/', (req, res) => {
  console.log('Root route accessed at:', new Date().toISOString());
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
  const prediction = new Prediction({ userId, color, result: 'pending' });
  await prediction.save();

  socket.on('result', async (gameResult) => {
    await Prediction.updateOne({ _id: prediction._id }, { result: gameResult });
    const user = await User.findById(userId);
    if (color === gameResult) {
      await User.findByIdAndUpdate(userId, { $inc: { winStreak: 1 } });
      if (user.winStreak + 1 === 3) {
        await User.findByIdAndUpdate(userId, { $inc: { balance: 50 }, winStreak: 0 });
        io.to(userId).emit('bonus', 'WinStreak Bonus: ₹50');
      }
    } else {
      await User.findByIdAndUpdate(userId, { winStreak: 0 });
    }
  });

  res.json({ success: true, message: 'Prediction saved, waiting for result' });
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
  res.json({ balance: user.balance, vipLevel: user.vipLevel, winStreak: user.winStreak });
});

// Recharge
app.post('/api/recharge', authenticateToken, async (req, res) => {
  const { amount, method, transactionId } = req.body;
  const userId = req.user.userId;
  const user = await User.findById(userId);
  const transactionCount = await Transaction.countDocuments({ userId, type: 'recharge' });
  let bonus = 0;
  if (transactionCount === 0) {
    bonus = amount * 0.1; // 10% bonus on first recharge
  }
  const transaction = new Transaction({ userId, type: 'recharge', amount, method, transactionId, status: 'pending' });
  await transaction.save();
  await User.findByIdAndUpdate(userId, { $inc: { balance: amount + bonus } });
  if (bonus > 0) {
    io.to(userId).emit('bonus', `First Deposit Bonus: ₹${bonus}`);
  }
  res.json({ success: true, message: 'Recharge successful, pending verification' });
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
  await User.findByIdAndUpdate(referrer._id, { $inc: { balance: 50 } });
  res.json({ success: true, message: 'Referral successful' });
});

// Profile
app.get('/api/profile/:userId', authenticateToken, async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json({ username: user.username, balance: user.balance, vipLevel: user.vipLevel, referralCode: user.referralCode });
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const topUsers = await User.find().sort({ balance: -1 }).limit(10);
  res.json(topUsers.map(user => ({ username: user.username, balance: user.balance })));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
