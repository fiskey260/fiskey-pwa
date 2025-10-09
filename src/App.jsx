import React from "react";
import "./App.css"; // Make sure you have a CSS file for styling

function App() {
  return (
    <div className="App" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Fiskey Forex PWA 📈</h1>
        <p style={styles.subtitle}>
          Track your trades, monitor live Forex rates, and stay ahead of the market!
        </p>
        <div style={styles.buttons}>
          <button style={styles.primaryButton} onClick={() => alert("Start Trading clicked!")}>
            Start Trading
          </button>
          <button style={styles.secondaryButton} onClick={() => alert("Learn More clicked!")}>
            Learn More
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.sectionTitle}>Live Forex Rates (Placeholder)</h2>
        <p style={styles.sectionText}>
          EUR/USD: 1.0912 | GBP/USD: 1.2485 | USD/JPY: 147.85
        </p>
        <p style={styles.sectionText}>
          You can connect a real Forex API here to show live rates dynamically.
        </p>
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Fiskey PWA. All rights reserved.
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    color: "#0d9488",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#374151",
    marginBottom: "20px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: "#0d9488",
    marginBottom: "10px",
  },
  sectionText: {
    fontSize: "1rem",
    color: "#374151",
    marginBottom: "5px",
  },
  footer: {
    marginTop: "40px",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
};

export default App;
