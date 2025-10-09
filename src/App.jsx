// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('PWA installed');
    } else {
      console.log('PWA installation dismissed');
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
        <h1>FiskeyTrade</h1>
        <nav>
          <a href="#rates">Rates</a>
          <a href="#converter">Converter</a>
          <a href="#chart">Chart</a>
          <a href="#trading">Trading</a>
        </nav>
      </header>

      <main>
        {/* Rates Grid */}
        <section id="rates" className="rates-grid">
          <div className="rate-card">
            <strong>USD</strong>
            <p>1.00</p>
          </div>
          <div className="rate-card">
            <strong>EUR</strong>
            <p>0.92</p>
          </div>
          <div className="rate-card">
            <strong>GBP</strong>
            <p>0.81</p>
          </div>
        </section>

        {/* Currency Converter */}
        <section id="converter" className="converter-box">
          <h2>Currency Converter</h2>
          <div className="inputs">
            <input type="number" placeholder="Amount" />
            <select>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button>Convert</button>
          </div>
          <div className="result">Converted amount: 0</div>
        </section>

        {/* Chart Section */}
        <section id="chart" className="chart-box">
          <h2>Trading Chart</h2>
          <p>Chart placeholder</p>
        </section>

        {/* Trading UI */}
        <section id="trading" className="trade-grid">
          <div>
            <div className="balance-card">
              <h3>Balance</h3>
              <p>$10,000</p>
            </div>

            <div className="positions-card">
              <h3>Open Positions</h3>
              <div className="position-row">
                <span>EUR/USD</span>
                <span>+200</span>
                <button className="close-btn">Close</button>
              </div>
            </div>

            <div className="history-card">
              <h3>Trade History</h3>
              <div className="position-row">
                <span>USD/JPY</span>
                <span>+150</span>
              </div>
            </div>
          </div>

          <div className="order-card">
            <h3>Place Order</h3>
            <div className="inputs">
              <input type="number" placeholder="Amount" />
              <select>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <button className="primary">Submit</button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Install Button */}
      {showInstall && (
        <button className="install-fab" onClick={handleInstall}>
          Download App
        </button>
      )}
    </div>
  );
}

export default App;
