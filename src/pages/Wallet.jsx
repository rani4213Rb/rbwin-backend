import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

const Wallet = () => {
  const [walletBalance, setWalletBalance] = useState(500.75);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    ifsc: '',
    accountNumber: '',
    upiId: '',
  });
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  const handleRecharge = () => {
    if (!rechargeAmount) return alert("Amount daalein");
    const entry = {
      amount: rechargeAmount,
      status: 'Pending',
      time: new Date().toLocaleString(),
    };
    setRechargeHistory([entry, ...rechargeHistory]);
    setRechargeAmount('');
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt > walletBalance) {
      return alert("Sahi amount daalein ya balance kam hai");
    }
    const entry = {
      amount: amt,
      bank: bankDetails.bankName,
      upi: bankDetails.upiId,
      status: 'Pending',
      time: new Date().toLocaleString(),
    };
    setWithdrawHistory([entry, ...withdrawHistory]);
    setWalletBalance(walletBalance - amt);
    setWithdrawAmount('');
    setBankDetails({ bankName: '', ifsc: '', accountNumber: '', upiId: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center mb-6">
          <FaWallet className="text-4xl text-indigo-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">My Wallet</h1>
        </div>

        {/* Balance */}
        <div className="bg-indigo-600 rounded-xl p-6 mb-6 text-center">
          <p className="text-lg">Current Balance</p>
          <h2 className="text-4xl font-bold mt-2">₹{walletBalance.toFixed(2)}</h2>
        </div>

        {/* Recharge Section */}
        <div className="mb-8">
          <h2 className="text-xl mb-2 flex items-center">
            <FaPlusCircle className="mr-2" /> Recharge
          </h2>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full p-2 rounded mb-2 text-black"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
          />
          <div className="flex space-x-2 mb-2">
            {[200, 500, 1000].map((amt) => (
              <button
                key={amt}
                className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
                onClick={() => setRechargeAmount(amt.toString())}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <button
            onClick={handleRecharge}
            className="w-full bg-green-500 py-2 rounded font-semibold"
          >
            Submit Recharge
          </button>

          {/* UPI Section */}
          {rechargeHistory.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="mb-2 font-semibold">Pay using UPI below:</p>
              <p className="bg-white text-black p-2 rounded mb-2 font-mono">
                UPI: my2160272@okhdfcbank<br />
                UPI: yadav060@ptaxis
              </p>
              <div className="flex space-x-2">
                {["PhonePe", "Google Pay", "Paytm"].map((app) => (
                  <a
                    key={app}
                    href={`upi://pay?pa=my2160272@okhdfcbank&cu=INR`}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    target="_blank"
                  >
                    {app}
                  </a>
                ))}
              </div>

              {/* Hindi + English Instructions */}
              <div className="mt-4 bg-yellow-100 text-yellow-900 rounded p-3 text-sm font-medium">
                <p>1. न्यूनतम रिचार्ज राशि: <span className="font-bold">₹200</span></p>
                <p>2. कृपया कम से कम ₹200 का रिचार्ज करें। यदि आप ₹200 से कम का रिचार्ज करते हैं:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>System रिचार्ज ट्रैक नहीं कर पाएगा</li>
                  <li>Wallet में पैसे Add नहीं होंगे</li>
                </ul>
                <hr className="my-2 border-yellow-400" />
                <p>1. Minimum recharge amount: <span className="font-bold">₹200</span></p>
                <p>2. Please recharge with at least ₹200. If you recharge less than ₹200:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>System will not be able to track your payment</li>
                  <li>Wallet amount will not be credited</li>
                </ul>
              </div>

              <p className="text-xs mt-2 text-yellow-300">* Admin recharge </p>
            </div>
          )}
        </div>

        {/* Withdraw Section */}
        <div>
          <h2 className="text-xl mb-2 flex items-center">
            <FaMinusCircle className="mr-2" /> Withdraw
          </h2>
          <input
            type="number"
            placeholder="Withdraw Amount"
            className="w-full p-2 rounded mb-2 text-black"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bank Name"
            className="w-full p-2 rounded mb-2 text-black"
            value={bankDetails.bankName}
            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
          />
          <input
            type="text"
            placeholder="IFSC Code"
            className="w-full p-2 rounded mb-2 text-black"
            value={bankDetails.ifsc}
            onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
          />
          <input
            type="text"
            placeholder="Account Number"
            className="w-full p-2 rounded mb-2 text-black"
            value={bankDetails.accountNumber}
            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
          />
          <input
            type="text"
            placeholder="UPI ID (optional)"
            className="w-full p-2 rounded mb-2 text-black"
            value={bankDetails.upiId}
            onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
          />
          <button
            onClick={handleWithdraw}
            className="w-full bg-red-500 py-2 rounded font-semibold"
          >
            Submit Withdraw
          </button>
          <p className="text-xs mt-2 text-yellow-300">* Withdraw request admin verify karega</p>
        </div>

        {/* Recharge History */}
        <div className="mt-6">
          <h3 className="text-lg mb-2">Recharge History</h3>
          {rechargeHistory.length === 0 ? (
            <p className="text-sm text-gray-300">No recharge yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {rechargeHistory.map((r, i) => (
                <li key={i} className="bg-white bg-opacity-10 p-2 rounded">
                  ₹{r.amount} - {r.status} ({r.time})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Withdraw History */}
        <div className="mt-6">
          <h3 className="text-lg mb-2">Withdraw History</h3>
          {withdrawHistory.length === 0 ? (
            <p className="text-sm text-gray-300">No withdraw yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {withdrawHistory.map((w, i) => (
                <li key={i} className="bg-white bg-opacity-10 p-2 rounded">
                  ₹{w.amount} - {w.status} ({w.time})
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Wallet;
