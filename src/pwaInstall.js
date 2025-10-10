// src/pwaInstall.js
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the automatic mini-infobar
  e.preventDefault();
  deferredPrompt = e;

  // Show your install button
  const installBtn = document.getElementById("install-button");
  if (installBtn) {
    installBtn.style.display = "block";
  }
});

export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    alert("Install prompt not available yet. Please try again later.");
    return;
  }

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("✅ PWA install accepted");
  } else {
    console.log("❌ PWA install dismissed");
  }

  deferredPrompt = null;
};
