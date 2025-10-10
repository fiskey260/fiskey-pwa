import { useEffect } from "react";

export default function PayPalButton() {
  useEffect(() => {
    if (window.paypal) {
      window.paypal.HostedButtons({ hostedButtonId: "6E5V3XTHK92NQ" })
        .render("#paypal-button-container");
    } else {
      console.error("PayPal SDK not loaded");
    }
  }, []);

  return <div id="paypal-button-container"></div>;
  }
