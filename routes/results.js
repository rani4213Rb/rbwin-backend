const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// Get all results
router.get('/', async (req, res) => {
  const results = await Result.find().sort({ createdAt: -1 }).limit(100);
  res.json(results);
});

module.exports = router;
