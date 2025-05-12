import React from "react";
import { motion } from "framer-motion";
import { FaMoneyBillWave } from "react-icons/fa";

const Recharge = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-6">
          <FaMoneyBillWave className="text-4xl text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Recharge</h1>
        </div>

        <form className="space-y-4">
          <div>
            <label className="text-white block mb-1">Enter Amount</label>
            <input
              type="number"
              placeholder="₹200 minimum"
              className="w-full p-3 rounded-lg bg-white/80 focus:outline-none"
              min={200}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          >
            Proceed to Pay
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Recharge;
