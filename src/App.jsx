// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const RATES_API = "https://open.er-api.com/v6/latest/USD"; // USD base

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(() => loadFromStorage("chartData", []));
  const [basePair] = useState({ base: "USD", quote: "KES" });
  const [amount, setAmount] = useState(100); // default trade size
  const [side, setSide] = useState("buy"); // buy or sell
  const [balance, setBalance] = useState(() =>
    loadFromStorage("balance", { USD: 1000, KES: 156500 })
  );
  const [positions, setPositions] = useState(() => loadFromStorage("positions", []));
  const [history, setHistory] = useState(() => loadFromStorage("history", []));
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshRef = useRef(null);

  // Fetch live rates and update chart data
  const fetchRates = async () => {
    try {
      const res = await fetch(RATES_API);
      const data = await res.json();
      if (!data || !data.rates) throw new Error("Invalid rates response");
      setRates(data.rates);
      setLoading(false);
      setLastUpdated(new Date().toISOString());

      // update USD->KES value for chart
      const kes = data.rates.KES;
      if (kes) {
        const point = {
          time: new Date().toLocaleTimeString(),
          rate: Number(kes.toFixed(2)),
        };
        setChartData((prev) => {
          const next = [...prev.slice(-49), point]; // keep last 50 points max
          saveToStorage("chartData", next);
          return next;
        });
      }

      setError(null);
    } catch (err) {
      setError("Failed to load rates");
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchRates();

    // auto-refresh every 15 seconds (you can change)
    refreshRef.current = setInterval(fetchRates, 15000);
    return () => clearInterval(refreshRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist balance/positions/history
  useEffect(() => saveToStorage("balance", balance), [balance]);
  useEffect(() => saveToStorage("positions", positions), [positions]);
  useEffect(() => saveToStorage("history", history), [history]);

  // Utility: get mid-market price for a pair (base USD)
  const getPrice = (from, to) => {
    if (!rates) return null;
    // rates are relative to USD: rates["KES"] is USD->KES
    // To compute from->to: (1 / rates[from]) * rates[to]
    if (from === "USD") {
      return rates[to] || null;
    }
    if (to === "USD") {
      return 1 / (rates[from] || Infinity);
    }
    const price = (1 / (rates[from] || 1)) * (rates[to] || 1);
    return price;
  };

  // Execute a simulated market order
  const executeMarketOrder = () => {
    const from = "USD";
    const to = "KES";
    const price = getPrice(from, to);
    if (!price) {
      setError("Price unavailable");
      return;
    }

    // For simplicity: amount is in base currency (USD) when buying USD→KES
    // We'll interpret 'amount' as amount in USD for buy, or amount in KES for sell.
    let trade;
    if (side === "buy") {
      // Spend USD to get KES: USD_amount * price -> KES_received
      const usdAmount = Number(amount);
      if (isNaN(usdAmount) || usdAmount <= 0) return setError("Invalid amount");
      if ((balance.USD || 0) < usdAmount) return setError("Insufficient USD balance");
      const kesReceived = usdAmount * price;
      // update balances
      setBalance((b) => ({ ...b, USD: (b.USD || 0) - usdAmount, KES: (b.KES || 0) + kesReceived }));
      // add position (aggregated)
      const pos = {
        id: Date.now(),
        side: "long",
        baseCurrency: "USD",
        quoteCurrency: "KES",
        entryPrice: price,
        baseAmount: usdAmount,
        quoteAmount: kesReceived,
        time: new Date().toISOString(),
      };
      setPositions((p) => [pos, ...p]);
      trade = { ...pos, executedPrice: price, action: "BUY" };
    } else {
      // SELL: selling KES to receive USD
      const kesAmount = Number(amount);
      if (isNaN(kesAmount) || kesAmount <= 0) return setError("Invalid amount");
      if ((balance.KES || 0) < kesAmount) return setError("Insufficient KES balance");
      const usdReceived = kesAmount / price;
      setBalance((b) => ({ ...b, KES: (b.KES || 0) - kesAmount, USD: (b.USD || 0) + usdReceived }));
      const pos = {
        id: Date.now(),
        side: "short",
        baseCurrency: "KES",
        quoteCurrency: "USD",
        entryPrice: price,
        baseAmount: kesAmount,
        quoteAmount: usdReceived,
        time: new Date().toISOString(),
      };
      setPositions((p) => [pos, ...p]);
      trade = { ...pos, executedPrice: price, action: "SELL" };
    }

    // record history
    setHistory((h) => [{ ...trade }, ...h].slice(0, 200));
    setError(null);
  };

  const closePosition = (posId) => {
    // simulate closing by reversing at current price
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;
    const priceNow = getPrice("USD", "KES") || pos.entryPrice;

    if (pos.side === "long") {
      // long: we bought KES with USD; closing means selling KES now -> USD
      const kes = pos.quoteAmount;
      const usdBack = kes / priceNow;
      setBalance((b) => ({ ...b, USD: (b.USD || 0) + usdBack }));
    } else {
      // short: we sold KES for USD initially; closing means buying KES back -> reduce USD
      const usdToReturn = pos.quoteAmount;
      setBalance((b) => ({ ...b, KES: (b.KES || 0) + pos.baseAmount }));
    }

    setPositions((p) => p.filter((x) => x.id !== posId));
    setHistory((h) => [{ action: "CLOSE", posId, time: new Date().toISOString() }, ...h].slice(0, 200));
  };

  // helper: format balances nicely
  const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : v);

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>💹 Fiskey Trading (Demo)</h1>
        <nav>
          <a href="#rates">Rates</a>
          <a href="#trade">Trade</a>
          <a href="#chart">Chart</a>
        </nav>
      </header>

      <main>
        <section id="rates">
          <h2>Live Rates (USD base)</h2>
          {loading && <p>Loading rates...</p>}
          {error && <p style={{ color: "#f87171" }}>{error}</p>}
          {!loading && (
            <>
              <div className="rates-grid">
                {Object.entries(rates)
                  .slice(0, 12)
                  .map(([cur, v]) => (
                    <div className="rate-card" key={cur}>
                      <strong>{cur}</strong>
                      <span>{Number(v).toFixed(4)}</span>
                    </div>
                  ))}
              </div>
              <p style={{ marginTop: 10, opacity: 0.8 }}>Last updated: {lastUpdated}</p>
            </>
          )}
        </section>

        <section id="trade">
          <h2>Trading Panel (Simulated)</h2>

          <div className="trade-grid">
            <div className="trade-left">
              <div className="balance-card">
                <h3>Balances</h3>
                <p>USD: {fmt(balance.USD)}</p>
                <p>KES: {fmt(balance.KES)}</p>
              </div>

              <div className="order-card">
                <h3>New Market Order (Demo)</h3>
                <div className="inputs">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                  />
                  <select value={side} onChange={(e) => setSide(e.target.value)}>
                    <option value="buy">Buy USD → KES</option>
                    <option value="sell">Sell KES → USD</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="primary" onClick={executeMarketOrder}>
                    Execute Market {side === "buy" ? "Buy" : "Sell"}
                  </button>
                  <button
                    onClick={() => {
                      setAmount(0);
                      setError(null);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="trade-right">
              <div className="positions-card">
                <h3>Open Positions</h3>
                {positions.length === 0 && <p>No open positions</p>}
                {positions.map((p) => (
                  <div className="position-row" key={p.id}>
                    <div>
                      <strong>{p.side === "long" ? "LONG" : "SHORT"}</strong>
                      <div style={{ fontSize: 12 }}>{p.time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>Entry: {Number(p.entryPrice).toFixed(2)}</div>
                      <div>
                        {p.side === "long" ? `${p.baseAmount} USD → ${p.quoteAmount.toFixed(2)} KES` : `${p.baseAmount} KES → ${p.quoteAmount.toFixed(2)} USD`}
                      </div>
                      <button className="close-btn" onClick={() => closePosition(p.id)}>
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="history-card">
                <h3>Trade History</h3>
                {history.length === 0 && <p>No history</p>}
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                    {h.action ? `${h.action} ${h.posId || ""}` : h.action === undefined && h.executedPrice ? `${h.action || ""} ${h.executedPrice}` : JSON.stringify(h).slice(0, 80)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="chart">
          <h2>USD → KES Live Trend</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#14b8a6" />
                <YAxis stroke="#14b8a6" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
                     }
