// src/App.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Capture PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const convertCurrency = () => {
    const rates = { USD: 1, EUR: 0.93, GBP: 0.82 };
    const converted = (amount / rates[from]) * rates[to];
    setResult(converted.toFixed(2));
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Trading Price",
        data: [120, 130, 125, 140, 135, 145, 150],
        borderColor: "#0d9488",
        backgroundColor: "rgba(14, 203, 129, 0.2)",
      },
    ],
  };

  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
        <h1>FiskeyTrade</h1>
        <nav>
          <a href="#rates">Rates</a>
          <a href="#converter">Converter</a>
          <a href="#trade">Trade</a>
        </nav>
      </header>

      {/* Main */}
      <main>
        <section id="rates">
          <h2>Exchange Rates</h2>
          <div className="rates-grid">
            <div className="rate-card">
              <strong>USD</strong> 1.00
            </div>
            <div className="rate-card">
              <strong>EUR</strong> 0.93
            </div>
            <div className="rate-card">
              <strong>GBP</strong> 0.82
            </div>
          </div>
        </section>

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
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button onClick={convertCurrency}>Convert</button>
          </div>
          {result && <div className="result">{result}</div>}
        </section>

        <section id="trade" className="trade-grid">
          {/* Left column */}
          <div>
            <div className="balance-card">
              <h3>Balance</h3>
              <p>$10,000</p>
            </div>
            <div className="positions-card">
              <h3>Open Positions</h3>
              <div className="position-row">
                <span>EUR/USD</span>
                <span>+50</span>
                <button className="close-btn">Close</button>
              </div>
            </div>
            <div className="history-card">
              <h3>History</h3>
              <div className="position-row">
                <span>GBP/USD</span>
                <span>-20</span>
              </div>
            </div>
          </div>

          {/* Right column: order card */}
          <div className="order-card">
            <h3>Place Order</h3>
            <div className="inputs">
              <select>
                <option>Buy</option>
                <option>Sell</option>
              </select>
              <input type="number" placeholder="Amount" />
              <button className="primary">Submit</button>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="chart-box">
          <h2>Market Chart</h2>
          <Line data={chartData} />
        </section>
      </main>

      {/* Floating Install Button */}
      {!isInstalled && (
        <button className="install-fab" onClick={handleInstall}>
          Download App
        </button>
      )}
    </div>
  );
}

export default App;
