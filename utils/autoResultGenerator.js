const Result = require('../models/Result');
const { getIo } = require('./socket');

const generateRandomResult = () => {
  const colors = ['green', 'red', 'violet'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const number = Math.floor(Math.random() * 10); // 0-9
  const bigSmall = number >= 5 ? 'big' : 'small';
  return { color, number, bigSmall };
};

const generateAndBroadcastResult = async (type) => {
  const { color, number, bigSmall } = generateRandomResult();

  // Generate period number
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const lastResult = await Result.findOne({ type }).sort({ createdAt: -1 });
  let sequence = 1;

  if (lastResult) {
    const lastPeriod = lastResult.period.split('-');
    if (lastPeriod[0] === datePart) {
      sequence = parseInt(lastPeriod[1]) + 1;
    }
  }

  const period = `${datePart}-${String(sequence).padStart(4, '0')}`;

  const newResult = new Result({ period, type, color, number, bigSmall });
  await newResult.save();

  console.log(`--- Result Generated ---`);
  console.log(`Type: ${type}`);
  console.log(`Period: ${period}`);
  console.log(`Color: ${color}`);
  console.log(`Number: ${number}`);
  console.log(`Big/Small: ${bigSmall}`);
  console.log(`------------------------`);

  const io = getIo();
  if (io) {
    io.emit(`new_result_${type}`, newResult);
    console.log(`Broadcasted new_result_${type}`);
  } else {
    console.log(`Socket IO not initialized.`);
  }
};

const startResultGeneration = () => {
  const intervals = {
    '30s': 30 * 1000,
    '1min': 60 * 1000,
    '3min': 3 * 60 * 1000,
  };

  Object.entries(intervals).forEach(([type, interval]) => {
    setInterval(() => generateAndBroadcastResult(type), interval);
    console.log(`Started auto result for ${type} interval`);
  });
};

module.exports = { startResultGeneration };
