import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [converted, setConverted] = useState(null);
  const [rates, setRates] = useState({});
  const [chartData, setChartData] = useState({});
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Install prompt
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Fetch live rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get("https://api.exchangerate.host/latest?base=USD");
        setRates(res.data.rates);
        setChartData({
          labels: Object.keys(res.data.rates).slice(0, 10),
          datasets: [
            {
              label: "Exchange Rate vs USD",
              data: Object.values(res.data.rates).slice(0, 10),
              borderColor: "#0d9488",
              backgroundColor: "rgba(20,184,166,0.2)",
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRates();
  }, []);

  const handleConvert = () => {
    const rate = rates[toCurrency];
    if (rate) setConverted((parseFloat(amount) * rate).toFixed(2));
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      alert("Installation not available on this device.");
    }
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

      <main>
        <h2>Welcome to FiskeyTrade 🚀</h2>
        <p>Your PWA Trading App is live with real rates & charts!</p>

        {/* Rates */}
        <section id="rates" className="rates-grid">
          {Object.entries(rates)
            .slice(0, 10)
            .map(([currency, rate]) => (
              <div key={currency} className="rate-card">
                <strong>{currency}</strong> {rate.toFixed(4)}
              </div>
            ))}
        </section>

        {/* Converter */}
        <section id="converter" className="converter-box">
          <div className="inputs">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <span>→</span>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <button onClick={handleConvert}>Convert</button>
          {converted && <div className="result">{converted} {toCurrency}</div>}
        </section>

        {/* Trading & Chart */}
        <section id="trade" className="trade-grid">
          <div>
            <div className="balance-card">
              <h3>Balance</h3>
              <p>USD 10,000</p>
            </div>

            <div className="order-card">
              <h3>New Order</h3>
              <div className="inputs">
                <input type="text" placeholder="Symbol" />
                <input type="number" placeholder="Amount" />
                <select>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <button className="primary">Submit</button>
              </div>
            </div>

            <div className="positions-card">
              <h3>Positions</h3>
              <div className="position-row">
                <span>USD/EUR 100</span>
                <button className="close-btn">Close</button>
              </div>
            </div>
          </div>

          <div className="chart-box">
            <h3>Exchange Chart</h3>
            <Line data={chartData} />
          </div>
        </section>
      </main>

      {/* Install Button */}
      <button className="install-fab" onClick={handleInstall}>
        Download App
      </button>
    </div>
  );
}

export default App;
