// --- ui.js ---
function updateDebugUI() {
  const debug = document.getElementById("debug");
  if (!debug) return;

  debug.textContent = `Max Power: ${upgradeTargets.maxPower.toFixed(2)}`;
}


function updateShop() {
  upgrades.forEach(upg => {
    const btn = document.getElementById(`upgrade-${upg.id}`);
    const level = game.upgrades[upg.id] || 0;
    const cost = getUpgradeCost(upg);
    const currency = upg.cost.currency;
    const affordable = game.currencies[currency] >= cost;

    if (level >= upg.maxLevel) {
      btn.textContent = `${upg.name} (MAXED)`;
      btn.disabled = true;
    } else {
      btn.textContent = `${upg.name} (${upg.cost.prefix}${cost}${upg.cost.suffix}) [LVL ${level}/${upg.maxLevel}]`;
      btn.disabled = !affordable;
    }
  });
  

  document.getElementById("money").textContent = `Money: ${game.currencies.money}`;
}

function renderUI() {
  document.getElementById("money").textContent = `Money: ${money}`;
  updateShop();
  updateDebugUI();
  requestAnimationFrame(renderUI);
}
