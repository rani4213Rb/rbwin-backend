const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { initSocket } = require('./utils/socket');
const { startResultGeneration } = require('./utils/autoResultGenerator');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resultRoutes = require('./routes/results');

const app = express();
const server = http.createServer(app);
initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultRoutes);

// Connect MongoDB and Start Server
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB Connected');
  server.listen(5000, () => {
    console.log('Server running on port 5000');
    startResultGeneration(); // Auto result system start
  });
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
});
