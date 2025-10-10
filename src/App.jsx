import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function App() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [converted, setConverted] = useState(0);

  const rates = [
    { currency: "USD", rate: 1 },
    { currency: "EUR", rate: 0.92 },
    { currency: "GBP", rate: 0.78 }
  ];

  const handleConvert = () => {
    const fromRate = rates.find(r => r.currency === fromCurrency)?.rate || 1;
    const toRate = rates.find(r => r.currency === toCurrency)?.rate || 1;
    setConverted((amount / fromRate) * toRate);
  };

  const chartData = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 120 },
    { name: "Mar", value: 90 },
    { name: "Apr", value: 110 }
  ];

  return (
    <div>
      <nav className="navbar">
        <h1>FiskeyTrade</h1>
        <div>
          <a href="#">Home</a>
          <a href="#">Rates</a>
          <a href="#">Trading</a>
        </div>
      </nav>

      <main>
        <h2>Exchange Rates</h2>
        <div className="rates-grid">
          {rates.map(r => (
            <div className="rate-card" key={r.currency}>
              <strong>{r.currency}</strong>
              <span>{r.rate}</span>
            </div>
          ))}
        </div>

        <div className="converter-box">
          <h2>Currency Converter</h2>
          <div className="inputs">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}>
              {rates.map(r => <option key={r.currency}>{r.currency}</option>)}
            </select>
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}>
              {rates.map(r => <option key={r.currency}>{r.currency}</option>)}
            </select>
            <button onClick={handleConvert}>Convert</button>
          </div>
          <div className="result">Result: {converted.toFixed(2)}</div>
        </div>

        <div className="chart-box">
          <h2>Trading Chart</h2>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0d9488" />
          </LineChart>
        </div>
      </main>

      <button className="install-fab">Download App</button>
    </div>
  );
}

export default App;
