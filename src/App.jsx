import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [converted, setConverted] = useState(0);

  const rates = [
    { currency: "USD", rate: 1 },
    { currency: "EUR", rate: 0.92 },
    { currency: "GBP", rate: 0.78 }
  ];

  const handleConvert = () => {
    const fromRate = rates.find(r => r.currency === fromCurrency)?.rate || 1;
    const toRate = rates.find(r => r.currency === toCurrency)?.rate || 1;
    setConverted((amount / fromRate) * toRate);
  };

  const chartData = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 120 },
    { name: "Mar", value: 90 },
    { name: "Apr", value: 110 }
  ];

  // PayPal Hosted Button
  useEffect(() => {
    if (window.paypal) {
      window.paypal.HostedButtons({
        hostedButtonId: "6E5V3XTHK92NQ"
      }).render("#paypal-button-container");
    } else {
      console.error("PayPal SDK not loaded");
    }
  }, []);

  // Fade-in animation for sections
  useEffect(() => {
    const sections = document.querySelectorAll(".fade-in-section");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <nav className="navbar">
        <h1>FiskeyTrade</h1>
        <div>
          <a href="#">Home</a>
          <a href="#">Rates</a>
          <a href="#">Trading</a>
        </div>
      </nav>

      <main>
        <h2>Exchange Rates</h2>
        <div className="rates-grid fade-in-section">
          {rates.map(r => (
            <div className="rate-card" key={r.currency}>
              <strong>{r.currency}</strong>
              <span>{r.rate}</span>
            </div>
          ))}
        </div>

        <div className="converter-box fade-in-section">
          <h2>Currency Converter</h2>
          <div className="inputs">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
              {rates.map(r => <option key={r.currency}>{r.currency}</option>)}
            </select>
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
              {rates.map(r => <option key={r.currency}>{r.currency}</option>)}
            </select>
            <button onClick={handleConvert}>Convert</button>
          </div>
          <div className="result">Result: {converted.toFixed(2)}</div>
        </div>

        <div className="chart-box fade-in-section">
          <h2>Trading Chart</h2>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0d9488" />
          </LineChart>
        </div>

        <div className="paypal-box fade-in-section">
          <h2>Support FiskeyTrade</h2>
          <p>Your support helps us keep providing real-time Forex tools. Any contribution is appreciated!</p>
          <div className="paypal-tooltip-wrapper">
            <div id="paypal-button-container"></div>
            <span className="paypal-tooltip">Safe & Secure PayPal Donation</span>
          </div>
        </div>
      </main>

      <button className="install-fab">Download App</button>
    </div>
  );
}

export default App;
