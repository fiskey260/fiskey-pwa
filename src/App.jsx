import React, { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [rates, setRates] = useState({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.81,
    JPY: 150.1,
  });
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // 💱 Convert currency
  const convert = () => {
    const rate = rates[toCurrency] / rates[fromCurrency];
    setResult((amount * rate).toFixed(2));
  };

  // 📲 Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("✅ App installed successfully!");
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div>
      {/* 🧭 Navbar */}
      <header className="navbar">
        <h1>Fiskey Trade</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Markets</a>
          <a href="#">Portfolio</a>
          <a href="#">Settings</a>
        </nav>
      </header>

      <main>
        <h2>🌍 Live Forex Rates</h2>
        <div className="rates-grid">
          {Object.keys(rates).map((currency) => (
            <div className="rate-card" key={currency}>
              <strong>{currency}</strong>${rates[currency]}
            </div>
          ))}
        </div>

        {/* 💱 Currency Converter */}
        <div className="converter-box">
          <h2>Currency Converter</h2>
          <div className="inputs">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur}>{cur}</option>
              ))}
            </select>
            <span>➡</span>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur}>{cur}</option>
              ))}
            </select>
            <button onClick={convert}>Convert</button>
          </div>
          {result && (
            <p className="result">
              {amount} {fromCurrency} = {result} {toCurrency}
            </p>
          )}
        </div>
      </main>

      {/* 📲 Floating Download Button */}
      {showInstallButton && (
        <button className="install-fab" onClick={handleInstallClick}>
          📲 Install App
        </button>
      )}
    </div>
  );
}
