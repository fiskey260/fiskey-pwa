import React, { useState } from 'react';

function App() {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState(null);

  const handleConvert = () => {
    const rates = { USD: 1, EUR: 0.92, GBP: 0.81 };
    const converted = (amount * (rates[to] / rates[from])).toFixed(2);
    setResult(`${amount} ${from} = ${converted} ${to}`);
  };

  return (
    <>
      <nav className="navbar">
        <h1>Fiskey PWA</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Trading</a>
          <a href="#">Rates</a>
        </nav>
      </nav>

      <main>
        <h2>Welcome to Fiskey PWA 🚀</h2>
        <p>Your Progressive Web App is running perfectly!</p>

        <div className="converter-box">
          <div className="inputs">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button onClick={handleConvert}>Convert</button>
          </div>
          {result && <div className="result">{result}</div>}
        </div>

        <button
          className="install-fab"
          onClick={() => alert('Install PWA via browser prompt')}
        >
          Download App
        </button>
      </main>
    </>
  );
}

export default App;
