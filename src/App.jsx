import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./App.css";

function App() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KES");
  const [converted, setConverted] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Fetch base rates
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

  // Fetch USD/KES trend (mocked historical data)
  useEffect(() => {
    async function fetchChart() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        const rate = data.rates.KES;
        // Generate mock trend data
        const history = Array.from({ length: 10 }).map((_, i) => ({
          day: `Day ${i + 1}`,
          rate: (rate * (1 + (Math.random() - 0.5) / 50)).toFixed(2),
        }));
        setChartData(history);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }
    fetchChart();
  }, []);

  const convertCurrency = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return;
    const usdValue = amount / rates[fromCurrency];
    const targetValue = usdValue * rates[toCurrency];
    setConverted(targetValue.toFixed(2));
  };

  return (
    <div className="app-container">
      {/* ✅ Navigation Bar */}
      <header className="navbar">
        <h1>💹 Fiskey Forex App</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#rates">Live Rates</a>
          <a href="#converter">Converter</a>
          <a href="#chart">Chart</a>
          <a href="#about">About</a>
        </nav>
      </header>

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

        {/* ✅ Currency Converter */}
        <section id="converter">
          <h2>💱 Currency Converter</h2>
          <div className="converter-box">
            <div className="inputs">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {Object.keys(rates).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
              <span>➡️</span>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {Object.keys(rates).map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={convertCurrency}>Convert</button>
            {converted && (
              <p className="result">
                {amount} {fromCurrency} = {converted} {toCurrency}
              </p>
            )}
          </div>
        </section>

        {/* ✅ Live Chart */}
        <section id="chart">
          <h2>📊 USD → KES Trend</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#14b8a6" />
                <YAxis stroke="#14b8a6" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
