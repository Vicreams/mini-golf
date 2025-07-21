// === main.js ===

let currentLevelIndex = 0;
let gameVisible = true;
let lastShopTab = "basic"; // default

// --- Load a level (generates map) ---
function loadLevel(index) {
  const level = levels[index];
  generateMap(level);
}

const tabGame = document.getElementById("tab-game");
const tabUpgrades = document.getElementById("tab-upgrades");
const gameView = document.getElementById("game-view");
const shopView = document.getElementById("shop-view");

const tabBasic = document.getElementById("tab-basic");
const tabPrestige = document.getElementById("tab-prestige");
const shopBasic = document.getElementById("shop-basic");
const shopPrestige = document.getElementById("shop-prestige");

function showGameView() {
  gameVisible=true
  gameView.style.display = "block";
  shopView.style.display = "none";
}

function showShopView() {
  gameVisible=false
  gameView.style.display = "none";
  shopView.style.display = "block";

  // Restore the last viewed sub-tab
  if (lastShopTab === "basic") {
    showBasicShop();
  } else {
    showPrestigeShop();
  }

  updateShop(); // Update prices and buttons
}

// --- Sub-tab handlers ---
function showBasicShop() {
  shopBasic.style.display = "block";
  shopPrestige.style.display = "none";
  lastShopTab = "basic";
}

function showPrestigeShop() {
  shopBasic.style.display = "none";
  shopPrestige.style.display = "block";
  lastShopTab = "prestige";
}

// --- Event Listeners ---
tabGame.addEventListener("click", showGameView);
tabUpgrades.addEventListener("click", showShopView);

tabBasic.addEventListener("click", showBasicShop);
tabPrestige.addEventListener("click", showPrestigeShop);


// --- Setup the upgrade shop ---
function buildShop(containerId = "shop-basic") {
  const shop = document.getElementById(containerId);
  shop.innerHTML = "";

  upgrades.forEach(upg => {
    if (upg.category !== "basic") return; // only basic for now

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


//power ups:
let revertCooldown = false;

const revertBtn = document.getElementById('revertBtn');

revertBtn.addEventListener('click', () => {
  if (revertCooldown) return;

  ball.style.left = `${window.currentLeft}px`;
  ball.style.top = `${window.currentTop}px`;
  velocityX = 0;
  velocityY = 0;

  revertCooldown = true;
  revertBtn.style.opacity = 0.5; // optional visual feedback

  setTimeout(() => {
    revertCooldown = false;
    revertBtn.style.opacity = 1;
  }, 5000);
});


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