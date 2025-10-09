// src/App.jsx
import React, { useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  // 📊 Mock chart data
  const chartData = [
    { time: "09:00", price: 1.102 },
    { time: "10:00", price: 1.108 },
    { time: "11:00", price: 1.105 },
    { time: "12:00", price: 1.110 },
    { time: "13:00", price: 1.107 },
  ];

  // 💱 Currency converter
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("KES");
  const [result, setResult] = useState(null);

  const rates = {
    USD: { KES: 153, EUR: 0.92 },
    KES: { USD: 0.0065, EUR: 0.006 },
    EUR: { USD: 1.08, KES: 165 },
  };

  const convertCurrency = () => {
    if (!amount || !rates[from][to]) return;
    const value = parseFloat(amount) * rates[from][to];
    setResult(`${value.toFixed(2)} ${to}`);
  };

  // 💹 Trading UI mock data
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [symbol, setSymbol] = useState("EUR/USD");
  const [lotSize, setLotSize] = useState(1);
  const [tradeType, setTradeType] = useState("Buy");

  const openTrade = () => {
    const newTrade = {
      id: Date.now(),
      symbol,
      type: tradeType,
      lotSize,
      profit: 0,
    };
    setPositions([...positions, newTrade]);
  };

  const closeTrade = (id) => {
    setPositions(positions.filter((trade) => trade.id !== id));
  };

  return (
    <div>
      {/* 🌐 Navbar */}
      <header className="navbar">
        <h1>Fiskey Trade</h1>
        <nav>
          <a href="#market">Market</a>
          <a href="#converter">Converter</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
      </header>

      {/* 🏦 Market Overview */}
      <main>
        <h2>Live Forex Market Overview</h2>
        <p>Monitor live prices, trade, and convert currencies in one place.</p>

        {/* Chart Section */}
        <div className="chart-box">
          <h3>EUR/USD Price Movement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="price" stroke="#0d9488" />
              <CartesianGrid stroke="#334155" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 💱 Currency Converter */}
        <section id="converter" className="converter-box">
          <h2>Currency Converter</h2>
          <div className="inputs">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
            </select>
            <span>→</span>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
            </select>
            <button onClick={convertCurrency}>Convert</button>
          </div>
          {result && <div className="result">Result: {result}</div>}
        </section>

        {/* 💹 Trading Dashboard */}
        <section id="dashboard" className="trade-grid">
          <div>
            <div className="balance-card">
              <h3>Account Balance</h3>
              <p>${balance.toFixed(2)}</p>
            </div>

            <div className="order-card">
              <h3>Place Order</h3>
              <div className="inputs">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="USD/KES">USD/KES</option>
                  <option value="GBP/USD">GBP/USD</option>
                </select>
                <select
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseFloat(e.target.value))}
                />
                <button className="primary" onClick={openTrade}>
                  Open
                </button>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="positions-card">
            <h3>Open Positions</h3>
            {positions.length === 0 ? (
              <p>No active trades</p>
            ) : (
              positions.map((trade) => (
                <div key={trade.id} className="position-row">
                  <span>
                    {trade.symbol} ({trade.type}) - {trade.lotSize} lot
                  </span>
                  <button
                    className="close-btn"
                    onClick={() => closeTrade(trade.id)}
                  >
                    Close
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
