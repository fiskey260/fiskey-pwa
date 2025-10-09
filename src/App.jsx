// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const RATES_API = "https://open.er-api.com/v6/latest/USD"; // free public API (USD base)
const REFRESH_MS = 15000; // 15s

// simple safe localStorage helpers
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export default function App() {
  const [rates, setRates] = useState({});
  const [loadingRates, setLoadingRates] = useState(true);
  const [chartData, setChartData] = useState(() => load("chartData", []));
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Trading state
  const [balance, setBalance] = useState(() =>
    load("balance", { USD: 1000.0, KES: 1000 * 156.5 })
  );
  const [positions, setPositions] = useState(() => load("positions", []));
  const [history, setHistory] = useState(() => load("history", []));

  // Order inputs
  const [orderSide, setOrderSide] = useState("buy"); // buy = buy USD->KES (spend USD to get KES)
  const [orderAmount, setOrderAmount] = useState(10); // amount interpreted depending on side
  const refreshRef = useRef(null);

  // Fetch rates and update chart
  const fetchRates = async () => {
    try {
      const res = await fetch(RATES_API);
      const json = await res.json();
      if (!json || !json.rates) throw new Error("Invalid rates response");
      setRates(json.rates);
      setLoadingRates(false);
      setLastUpdated(new Date().toLocaleString());
      setError(null);

      // USD -> KES rate as number
      const kes = json.rates?.KES;
      if (kes) {
        const point = {
          time: new Date().toLocaleTimeString(),
          rate: Number(kes.toFixed(4)),
        };
        setChartData((prev) => {
          const next = [...prev.slice(-99), point]; // keep last 100 points
          save("chartData", next);
          return next;
        });
      }
    } catch (err) {
      console.error("fetchRates error:", err);
      setError("Unable to fetch rates");
      setLoadingRates(false);
    }
  };

  // start/stop auto refresh
  useEffect(() => {
    fetchRates();
    refreshRef.current = setInterval(fetchRates, REFRESH_MS);
    return () => clearInterval(refreshRef.current);
  }, []);

  // persist trading state
  useEffect(() => save("balance", balance), [balance]);
  useEffect(() => save("positions", positions), [positions]);
  useEffect(() => save("history", history), [history]);

  // utility: compute price from one currency to another using USD base rates
  // price: 1 unit of `from` in units of `to`
  const getPrice = (from = "USD", to = "KES") => {
    if (!rates) return null;
    if (from === to) return 1;
    const rFrom = rates[from]; // USD -> from (units of from per 1 USD)
    const rTo = rates[to]; // USD -> to
    // If from === USD, price is rTo
    if (from === "USD") return rTo || null;
    if (to === "USD") return 1 / (rFrom || Infinity);
    // general: (1 / rFrom) * rTo
    return (1 / (rFrom || 1)) * (rTo || 1);
  };

  // Execute simulated market order
  // Interpretation:
  // - Buy: spend USD amount to receive KES (amount in USD)
  // - Sell: spend KES amount to receive USD (amount in KES)
  const executeOrder = () => {
    const price = getPrice("USD", "KES");
    if (!price) {
      setError("Price unavailable");
      return;
    }
    if (orderSide === "buy") {
      const usd = Number(orderAmount);
      if (!usd || usd <= 0) return setError("Enter a valid amount");
      if ((balance.USD || 0) < usd) return setError("Insufficient USD balance");
      const kesReceived = usd * price;
      // update balances
      setBalance((b) => ({ ...b, USD: (b.USD || 0) - usd, KES: (b.KES || 0) + kesReceived }));
      // add position (long USD->KES)
      const pos = {
        id: Date.now(),
        side: "LONG",
        entryPrice: Number(price.toFixed(4)),
        baseAmtUSD: usd,
        quoteAmtKES: Number(kesReceived.toFixed(2)),
        time: new Date().toLocaleString(),
      };
      setPositions((p) => [pos, ...p]);
      setHistory((h) => [{ type: "BUY", details: pos, time: new Date().toLocaleString() }, ...h].slice(0, 200));
      setError(null);
    } else {
      // sell: amount is KES
      const kes = Number(orderAmount);
      if (!kes || kes <= 0) return setError("Enter a valid amount");
      if ((balance.KES || 0) < kes) return setError("Insufficient KES balance");
      const usdReceived = kes / price;
      setBalance((b) => ({ ...b, KES: (b.KES || 0) - kes, USD: (b.USD || 0) + usdReceived }));
      const pos = {
        id: Date.now(),
        side: "SHORT",
        entryPrice: Number(price.toFixed(4)),
        baseAmtKES: kes,
        quoteAmtUSD: Number(usdReceived.toFixed(4)),
        time: new Date().toLocaleString(),
      };
      setPositions((p) => [pos, ...p]);
      setHistory((h) => [{ type: "SELL", details: pos, time: new Date().toLocaleString() }, ...h].slice(0, 200));
      setError(null);
    }
    // clear input
    setOrderAmount("");
  };

  // Close a position (simulate reversing at current price)
  const closePosition = (id) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;
    const priceNow = getPrice("USD", "KES") || pos.entryPrice;
    if (pos.side === "LONG") {
      // We bought KES with USD; closing sells KES back to USD
      const usdBack = pos.quoteAmtKES / priceNow;
      setBalance((b) => ({ ...b, USD: (b.USD || 0) + usdBack }));
    } else {
      // SHORT: we sold KES earlier; closing buys KES back -> return KES
      setBalance((b) => ({ ...b, KES: (b.KES || 0) + (pos.baseAmtKES || 0) }));
    }
    setPositions((p) => p.filter((x) => x.id !== id));
    setHistory((h) => [{ type: "CLOSE", posId: id, time: new Date().toLocaleString() }, ...h].slice(0, 200));
  };

  // small format helpers
  const fmt = (v, digits = 2) => (typeof v === "number" ? v.toFixed(digits) : v);
  const usdKesPrice = getPrice("USD", "KES");

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
        {/* RATES */}
        <section id="rates">
          <h2>Live Rates (USD base)</h2>
          {loadingRates && <p>Loading rates…</p>}
          {error && <p style={{ color: "#f87171" }}>{error}</p>}
          {!loadingRates && (
            <>
              <div className="rates-grid" aria-live="polite">
                {Object.entries(rates)
                  .slice(0, 12)
                  .map(([cur, v]) => (
                    <div className="rate-card" key={cur}>
                      <strong>{cur}</strong>
                      <span>{Number(v).toFixed(4)}</span>
                    </div>
                  ))}
              </div>
              <p style={{ marginTop: 10, opacity: 0.85 }}>
                USD → KES: {usdKesPrice ? fmt(usdKesPrice, 4) : "—"} • Last updated: {lastUpdated}
              </p>
            </>
          )}
        </section>

        {/* TRADE PANEL */}
        <section id="trade">
          <h2>Trading Panel (Simulated)</h2>

          <div className="trade-grid">
            <div>
              <div className="balance-card">
                <h3>Balances</h3>
                <p>USD: {fmt(balance.USD, 4)}</p>
                <p>KES: {fmt(balance.KES, 2)}</p>
              </div>

              <div className="order-card">
                <h3>New Market Order</h3>
                <div className="inputs">
                  <select value={orderSide} onChange={(e) => setOrderSide(e.target.value)}>
                    <option value="buy">Buy (USD → KES)</option>
                    <option value="sell">Sell (KES → USD)</option>
                  </select>

                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder={orderSide === "buy" ? "Amount in USD" : "Amount in KES"}
                  />

                  <button className="primary" onClick={executeOrder}>
                    Execute {orderSide === "buy" ? "Buy" : "Sell"}
                  </button>
                </div>
                <small style={{ opacity: 0.8, display: "block", marginTop: 8 }}>
                  Market price: USD→KES {usdKesPrice ? fmt(usdKesPrice, 4) : "—"}
                </small>
              </div>
            </div>

            <div>
              <div className="positions-card">
                <h3>Open Positions</h3>
                {positions.length === 0 && <p>No open positions</p>}
                {positions.map((p) => (
                  <div className="position-row" key={p.id}>
                    <div>
                      <strong>{p.side}</strong>
                      <div style={{ fontSize: 12 }}>{p.time}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>Entry: {fmt(p.entryPrice, 4)}</div>
                      <div style={{ fontSize: 13 }}>
                        {p.side === "LONG"
                          ? `${fmt(p.baseAmtUSD, 2)} USD → ${fmt(p.quoteAmtKES, 2)} KES`
                          : `${fmt(p.baseAmtKES, 2)} KES → ${fmt(p.quoteAmtUSD, 4)} USD`}
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
                {history.length === 0 && <p>No history yet</p>}
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                    {h.type ? `${h.type} @ ${h.time}` : JSON.stringify(h).slice(0, 80)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CHART */}
        <section id="chart">
          <h2>USD → KES Live Trend</h2>
          <div className="chart-box" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#14b8a6" />
                <YAxis stroke="#14b8a6" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#0d9488" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
        }
