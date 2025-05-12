import React, { useEffect, useState } from "react";
import socket from "../socket";
import { generatePeriodNumber } from "../utils/periodUtils";

const Betting = () => {
  const [timeSlot, setTimeSlot] = useState("1min");
  const [countdown, setCountdown] = useState(60);

  const [periods, setPeriods] = useState({
    "30s": generatePeriodNumber("30s", 1),
    "1min": generatePeriodNumber("1min", 1),
    "3min": generatePeriodNumber("3min", 1),
  });

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [bigSmall, setBigSmall] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(1000);
  const [betList, setBetList] = useState([]);
  const [liveResult, setLiveResult] = useState(null);
  const [highlightColor, setHighlightColor] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  const timeValues = {
    "30s": 30,
    "1min": 60,
    "3min": 180,
  };

  useEffect(() => {
    let interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          socket.emit("get-result", { timeSlot });
          return timeValues[timeSlot];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeSlot]);

  useEffect(() => {
    socket.on("live-result", (data) => {
      setLiveResult(data.result);
      setHighlightColor(data.result);
      setGameHistory((prev) => [data.result, ...prev.slice(0, 9)]);

      const slot = data.timeSlot;
      const current = periods[slot];
      const nextSeq = parseInt(current.split("-")[2]) + 1;
      const updated = generatePeriodNumber(slot, nextSeq);

      setTimeout(() => {
        setHighlightColor(null);
        setPeriods((prev) => ({ ...prev, [slot]: updated }));
      }, 3000);
    });

    return () => socket.off("live-result");
  }, [periods]);

  const placeBet = () => {
    const amt = parseInt(amount);
    if (!amt || amt < 1) return alert("Amount डालें");
    if (!selectedColor && selectedNumber === null && !bigSmall)
      return alert("कम से कम एक option चुनें");

    const newBet = {
      period: periods[timeSlot],
      color: selectedColor,
      number: selectedNumber,
      bigSmall,
      amount: amt,
      timeSlot,
    };

    setBetList([newBet, ...betList]);
    setWallet((prev) => prev - amt);
    setSelectedColor("");
    setSelectedNumber(null);
    setBigSmall("");
    setAmount("");
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-tr from-yellow-50 to-red-100 text-center">
      <h1 className="text-2xl font-bold mb-4 text-orange-800">RBWin - Betting</h1>

      <div className="flex justify-between bg-pink p-3 rounded-xl shadow mb-4 text-lg font-bold">
        <span className="text-purple-800">Wallet: ₹{wallet}</span>
        <span className="text-red-600">⏱️ {countdown}s</span>
        <span className="text-green-700">Period: {periods[timeSlot]}</span>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {["30s", "1min", "3min"].map((slot) => (
          <button
            key={slot}
            onClick={() => {
              setTimeSlot(slot);
              setCountdown(timeValues[slot]);
            }}
            className={`px-4 py-2 rounded-full font-semibold ${
              timeSlot === slot ? "bg-maroon-500 text-white" : "bg-orange-200"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Live Result:</h2>
        <div className="text-3xl font-bold text-purple-700">
          {liveResult || "Waiting..."}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {["Red", "Green", "Violet"].map((clr) => (
          <button
            key={clr}
            onClick={() => {
              setSelectedColor(clr);
              setSelectedNumber(null);
              setBigSmall("");
            }}
            className={`py-2 rounded-full text-pink font-bold transition-transform duration-300 ${
              selectedColor === clr ? "scale-110 ring-2 ring-black" : ""
            } ${highlightColor === clr ? "ring-4 ring-yellow-400 scale-110" : ""} ${
              clr === "Red"
                ? "bg-red-500"
                : clr === "Green"
                ? "bg-green-500"
                : "bg-purple-500"
            }`}
          >
            {clr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedNumber(i);
              setSelectedColor("");
              setBigSmall("");
            }}
            className={`py-2 font-bold rounded-lg ${
              selectedNumber === i ? "bg-yellow-500 text-white" : "bg-white"
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-5 mb-4">
        {["Big", "Small"].map((val) => (
          <button
            key={val}
            onClick={() => {
              setBigSmall(val);
              setSelectedColor("");
              setSelectedNumber(null);
            }}
            className={`px-6 py-2 rounded-full font-bold ${
              bigSmall === val ? "bg-blue-600 text-blue" : "bg-blue-200"
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded px-4 py-2 w-32"
        />
        <button
          onClick={placeBet}
          className="bg-green-600 hover:bg-green-700 text-red px-6 py-2 rounded-lg font-bold"
        >
          Place Bet
        </button>
      </div>

      <div className="bg-yellow p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-bold mb-2 text-gray-800">Your Bet History</h3>
        <ul className="text-left space-y-1 text-sm text-gray-700">
          {betList.map((bet, index) => (
            <li key={index}>
              {bet.timeSlot} | Period: {bet.period}, ₹{bet.amount},{" "}
              {bet.color && `Color: ${bet.color}`}{" "}
              {bet.number !== null && `Number: ${bet.number}`}{"0123456789 "}
              {bet.bigSmall && `Size: ${bet.bigSmall}`}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-pink p-4 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2 text-gray-800">Game History</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {gameHistory.map((res, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-purple font-bold ${
                res === "Red"
                  ? "bg-red-500"
                  : res === "Green"
                  ? "bg-green-500"
                  : res === "Violet"
                  ? "bg-purple-500"
                  : "bg-gray-500"
              }`}
            >
              {res}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Betting;
