// === main.js ===

let currentLevelIndex = 0;

// --- Load a level (generates map) ---
function loadLevel(index) {
  const level = levels[index];
  generateMap(level);
}

// --- Setup the upgrade shop ---
function buildShop(containerId = "shop") {
  const shop = document.getElementById(containerId);
  shop.innerHTML = "";

  upgrades.forEach(upg => {
    const btn = document.createElement("button");
    btn.className = "shop-button";
    btn.id = `upgrade-${upg.id}`;
    shop.appendChild(btn);

    btn.addEventListener("click", () => {
      const level = game.upgrades[upg.id] || 0;
      const cost = getUpgradeCost(upg);
      const currency = upg.cost.currency;

      if (game.currencies[currency] >= cost && level < upg.maxLevel) {
        game.currencies[currency] -= cost;
        game.upgrades[upg.id] = level + 1;

        applyUpgradeEffect(upg);
        if (typeof upg.fallback === "function") upg.fallback();

        updateShop();
        renderUI();
      }
    });
  });
}

// --- Full game initialization ---
window.addEventListener("DOMContentLoaded", () => {
  buildShop();
  renderUI();

  loadLevel(currentLevelIndex); // generates map and sets spawnTile

  const ball = document.getElementById("ball");
  const arrow = document.getElementById("arrow");

  if (!ball || !arrow) {
    console.error("❌ Missing ball or arrow in DOM.");
    return;
  }
});