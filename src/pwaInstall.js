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
  }

  console.log("✅ Install prompt captured and ready.");
});

// Function to manually trigger the install prompt
export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    alert("⚠️ Install prompt not available yet. Please try again later.");
    return;
  }

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === "accepted") {
    console.log("✅ PWA install accepted by user.");
  } else {
    console.log("❌ PWA install dismissed by user.");
  }

  // Clear the saved prompt so it cannot be reused
  deferredPrompt = null;
};
