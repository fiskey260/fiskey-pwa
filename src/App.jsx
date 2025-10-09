// src/App.jsx
import React, { useState } from "react";
import "./App.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function App() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("KES");
  const [result, setResult] = useState(null);

  // Dummy data for chart (can be connected to real API later)
  const chartData = [
    { date: "Mon", rate: 156 },
    { date: "Tue", rate: 158 },
    { date: "Wed", rate: 157 },
    { date: "Thu", rate: 160 },
    { date: "Fri", rate: 162 },
  ];

  const handleConvert = () => {
    // Example static rates — you can replace this with real API later
    const rates = {
      USD: 1,
      KES: 156.5,
      EUR: 0.92,
      GBP: 0.79,
    };
    const converted = (amount / rates[from]) * rates[to];
    setResult(`${converted.toFixed(2)} ${to}`);
  };

  return (
    <>
      <header className="navbar">
        <h1>💹 Fiskey Forex</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Converter</a>
          <a href="#">Rates</a>
        </nav>
      </header>

      <main>
        <h2>🌍 Live Forex Dashboard</h2>
        <p>Track and convert global currencies in real-time.</p>

        {/* Currency Converter */}
        <div className="converter-box">
          <h3>Currency Converter</h3>
          <div className="inputs">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <span>➡️</span>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <button onClick={handleConvert}>Convert</button>
          {result && <div className="result">Result: {result}</div>}
        </div>

        {/* Chart Section */}
        <div className="chart-box">
          <h3>Weekly USD to KES Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </>
  );
}

export default App;
