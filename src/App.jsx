import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        setRates(data.rates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forex rates:", error);
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  return (
    <div className="app-container">
      {/* ✅ Navigation Bar */}
      <header className="navbar">
        <h1>💹 Fiskey Forex App</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#rates">Live Rates</a>
          <a href="#about">About</a>
        </nav>
      </header>

      {/* ✅ Main Section */}
      <main>
        <section id="home">
          <h2>Welcome, Trader 👋</h2>
          <p>Stay ahead with real-time forex insights and updates.</p>
        </section>

        <section id="rates">
          <h2>🌍 Live Forex Rates (USD base)</h2>
          {loading ? (
            <p>Loading rates...</p>
          ) : (
            <div className="rates-grid">
              {Object.entries(rates)
                .slice(0, 10)
                .map(([currency, value]) => (
                  <div key={currency} className="rate-card">
                    <strong>{currency}</strong>
                    <span>{value.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section id="about">
          <h2>About Fiskey</h2>
          <p>
            Fiskey Forex App helps you track currency movements in real-time
            and make smarter trading decisions — anytime, anywhere.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
