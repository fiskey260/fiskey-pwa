import React from 'react';
import './App.css';

function App() {
  // For Download App Button
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  return (
    <div>
      <header className="navbar">
        <h1>FiskeyTrade</h1>
        <nav>
          <a href="#rates">Rates</a>
          <a href="#converter">Converter</a>
          <a href="#trading">Trading</a>
        </nav>
      </header>

      <main>
        <section id="rates">
          <h2>Forex Rates</h2>
          <div className="rates-grid">
            <div className="rate-card"><strong>USD/EUR</strong><p>1.07</p></div>
            <div className="rate-card"><strong>GBP/USD</strong><p>1.22</p></div>
          </div>
        </section>

        <section id="converter">
          <h2>Currency Converter</h2>
          <div className="converter-box">
            <div className="inputs">
              <input type="number" placeholder="Amount" />
              <select>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <button>Convert</button>
            </div>
            <div className="result">Result: --</div>
          </div>
        </section>

        <section id="trading">
          <h2>Trading Panel</h2>
          <div className="trade-grid">
            <div>
              <div className="balance-card">Balance: $1000</div>
              <div className="order-card">
                <div className="inputs">
                  <input placeholder="Amount" />
                  <select><option>Buy</option><option>Sell</option></select>
                  <button className="primary">Place Order</button>
                </div>
              </div>
            </div>
            <div>
              <div className="positions-card">Open Positions</div>
              <div className="history-card">Trade History</div>
            </div>
          </div>
        </section>
      </main>

      {deferredPrompt && (
        <button className="install-fab" onClick={handleInstallClick}>
          Download App
        </button>
      )}
    </div>
  );
}

export default App;
