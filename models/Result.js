const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  period: String,
  type: String,
  number: Number,
  color: String,
  size: String, // BIG or SMALL
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
