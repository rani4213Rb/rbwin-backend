import React, { useEffect, useState } from "react";
import socket from "../socket";

const LiveResult = () => {
  const [results, setResults] = useState({
    "30s": "Waiting...",
    "1min": "Waiting...",
    "3min": "Waiting...",
  });

  useEffect(() => {
    // Socket listener for all time slots
    socket.on("live-result", (data) => {
      const { timeSlot, result } = data;
      setResults((prev) => ({
        ...prev,
        [timeSlot]: result,
      }));
    });

    return () => socket.off("live-result");
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-tr from-purple-50 to-yellow-100 text-center">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Live Results Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["30s", "1min", "3min"].map((slot) => (
          <div key={slot} className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">{slot} Result</h2>
            <div className={`text-4xl font-bold ${
              results[slot] === "Red"
                ? "text-red-600"
                : results[slot] === "Green"
                ? "text-green-600"
                : results[slot] === "Violet"
                ? "text-purple-600"
                : "text-gray-700"
            }`}>
              {results[slot]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveResult;
