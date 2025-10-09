import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KES");
  const [result, setResult] = useState("");

  // 📱 PWA Install logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA installed successfully!");
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // 💱 Simple conversion logic
  const handleConvert = () => {
    if (amount === "" || isNaN(amount)) {
      setResult("Please enter a valid amount");
      return;
    }

    const rates = {
      USD: 1,
      KES: 156,
      EUR: 0.93,
      GBP: 0.79,
    };

    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const converted = ((amount / fromRate) * toRate).toFixed(2);
    setResult(`${amount} ${fromCurrency} = ${converted} ${toCurrency}`);
  };

  // 📦 Direct app download link (APK or ZIP)
  const handleDownloadClick = () => {
    const downloadUrl =
      "https://github.com/fiskey260/fiskey-pwa/releases/latest/download/fiskey-pwa.apk"; // 🟢 Replace with your real APK or ZIP link
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="App">
      <header className="navbar">
        <h1>Fiskey Forex</h1>
        <nav>
          <a href="#rates">Rates</a>
          <a href="#convert">Convert</a>
          <a href="#chart">Chart</a>
        </nav>
      </header>

      <main>
        <section id="rates">
          <h2>Live Forex Rates</h2>
          <div className="rates-grid">
            <div className="rate-card">
              <strong>USD/KES</strong> 156.00
            </div>
            <div className="rate-card">
              <strong>EUR/USD</strong> 1.07
            </div>
            <div className="rate-card">
              <strong>GBP/USD</strong> 1.26
            </div>
          </div>
        </section>

        <section id="convert" className="converter-box">
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
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <span>➡️</span>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button onClick={handleConvert}>Convert</button>
          </div>
          <div className="result">{result}</div>
        </section>

        <section id="chart" className="chart-box">
          <h2>Market Overview</h2>
          <p>📈 Chart data loading soon...</p>
        </section>
      </main>

      {/* 📲 Floating Action Buttons */}
      <div className="fab-container">
        {showInstall && (
          <button className="install-fab" onClick={handleInstallClick}>
            📲 Install App
          </button>
        )}
        <button className="download-fab" onClick={handleDownloadClick}>
          ⬇️ Download App
        </button>
      </div>
    </div>
  );
}

export default App;
