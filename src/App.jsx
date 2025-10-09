import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [rates, setRates] = useState({});
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [converted, setConverted] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    fetch("https://api.exchangerate.host/latest?base=USD")
      .then((res) => res.json())
      .then((data) => setRates(data.rates))
      .catch((err) => console.error(err));

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const convert = () => {
    if (amount && rates[toCurrency]) {
      setConverted((amount * rates[toCurrency]).toFixed(2));
    }
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
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

      {/* Main */}
      <main>
        <h2 id="rates">Currency Rates</h2>
        <div className="rates-grid">
          {Object.keys(rates)
            .slice(0, 10)
            .map((cur) => (
              <div className="rate-card" key={cur}>
                <strong>{cur}</strong>
                <span>{rates[cur].toFixed(2)}</span>
              </div>
            ))}
        </div>

        <h2 id="converter">Currency Converter</h2>
        <div className="converter-box">
          <div className="inputs">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
            <button className="primary" onClick={convert}>
              Convert
            </button>
          </div>
          {converted && <div className="result">{converted}</div>}
        </div>

        <h2 id="trade">Trading Dashboard</h2>
        <div className="trade-grid">
          <div>
            <div className="balance-card">Balance: $10,000</div>
            <div className="positions-card">
              <h3>Positions</h3>
              <div className="position-row">
                BTC/USD <span>+1.2%</span> <button className="close-btn">Close</button>
              </div>
            </div>
            <div className="history-card">
              <h3>History</h3>
              <div className="position-row">EUR/USD +0.5%</div>
            </div>
          </div>
          <div className="order-card">
            <h3>New Order</h3>
            <div className="inputs">
              <select>
                <option>Buy</option>
                <option>Sell</option>
              </select>
              <input type="number" placeholder="Amount" />
              <button className="primary">Execute</button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Install Button */}
      {deferredPrompt && (
        <button className="install-fab" onClick={handleInstall}>
          Download App
        </button>
      )}
    </div>
  );
}

export default App;
