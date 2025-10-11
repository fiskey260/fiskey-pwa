// src/pwaInstall.js

let deferredPrompt;

// Listen for the beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the default mini-infobar
  e.preventDefault();
  deferredPrompt = e;

  // Show the floating install button
  const installBtn = document.querySelector(".install-fab");
  if (installBtn) {
    installBtn.style.display = "block";

    // Add click listener only once
    const handleClick = async () => {
      await showInstallPrompt();
      installBtn.removeEventListener("click", handleClick);
    };
    installBtn.addEventListener("click", handleClick);
  }

  console.log("✅ Install prompt captured and ready.");
});

// Function to manually trigger the install prompt
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    alert("⚠️ Install prompt not available yet. Please try again later.");
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for user's choice
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("✅ User accepted the PWA installation.");
  } else {
    console.log("❌ User dismissed the PWA installation.");
  }

  // Reset the prompt
  deferredPrompt = null;

  // Hide the floating install button
  const installBtn = document.querySelector(".install-fab");
  if (installBtn) installBtn.style.display = "none";
};

// Log when the app is successfully installed
window.addEventListener("appinstalled", () => {
  console.log("🎉 FiskeyTrade PWA installed successfully!");
});
