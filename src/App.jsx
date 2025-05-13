import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import Live from "./pages/Live";
import Bet from "./pages/Bet";
import Wallet from "./pages/Wallet";
import Login from "./pages/Login";
import Signup from "./pages/Signup"; // optional
import { isLoggedIn } from "./utils/auth";

function App() {
  const loggedIn = isLoggedIn();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">RBWIN</h1>
            <div className="space-x-4">
              {loggedIn ? (
                <>
                  <Link to="/" className="hover:text-yellow-300">Live</Link>
                  <Link to="/bet" className="hover:text-yellow-300">Bet</Link>
                  <Link to="/wallet" className="hover:text-yellow-300">Wallet</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-yellow-300">Login</Link>
                  <Link to="/signup" className="hover:text-yellow-300">Signup</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-4">
          <Routes>
            {loggedIn ? (
              <>
                <Route path="/" element={<Live />} />
                <Route path="/bet" element={<Bet />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
