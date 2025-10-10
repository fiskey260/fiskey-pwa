// src/pwaInstall.js

let deferredPrompt;

// Listen for the beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the default mini-infobar from showing
  e.preventDefault();
  deferredPrompt = e;

  // Show the floating install button when prompt is ready
  const installBtn = document.querySelector(".install-fab");
  if (installBtn) {
    installBtn.style.display = "block";

    installBtn.addEventListener("click", async () => {
      await showInstallPrompt();
    });
  }

  console.log("✅ Install prompt captured and ready.");
});

// Function to manually trigger the install prompt
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    alert("⚠️ Install prompt not available yet. Please try again later.");
    return;
  }

  // Show the prompt
  deferredPrompt.prompt();

  // Wait for user's choice
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("✅ User accepted the PWA installation.");
  } else {
    console.log("❌ User dismissed the PWA installation.");
  }

  // Reset the prompt so it can’t be used again
  deferredPrompt = null;

  // Hide the floating button after interaction
  const installBtn = document.querySelector(".install-fab");
  if (installBtn) installBtn.style.display = "none";
};

// Log successful installation
window.addEventListener("appinstalled", () => {
  console.log("🎉 FiskeyTrade PWA installed successfully!");
});
