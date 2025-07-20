const ball = document.getElementById("ball");
const arrow = document.getElementById("arrow");

let dragging = false;
let startX = 0;
let startY = 0;
let velocityX = 0;
let velocityY = 0;
let money = 100;
let ballJustScored = false;


const upgradeTargets = {
  maxPower: 10,        // affects how hard you can shoot
  ballSpeed: 10,       // affects how fast the ball travels
  shotCooldown: 1.0    // seconds between shots
};


const game = {
  persist: {
    currencies: {
      money: 100,
      research: 0
    },
    upgrades: {
      // e.g. "maxPowerBoost": 2
    },
    unlocks: {
      upgrades: true,
      combat: false
    },
    other: {
      settings: {
        hide_complete_upgrades: false
      }
    }
  },
  non_persist: {
    run: {
      active: false
    }
  }
};




ball.addEventListener("mousedown", function (event) {
  dragging = true;
  startX = event.clientX;
  startY = event.clientY;
  arrow.style.display = "block";
});

document.addEventListener("mouseup", function (event) {
  if (!dragging) return;
  dragging = false;

  const endX = event.clientX;
  const endY = event.clientY;
  let dx = startX - endX;
  let dy = startY - endY
  const distance = Math.sqrt(dx**2 + dy**2);
  if (distance > upgradeTargets.maxPower) { // Limit max power
    const scale = upgradeTargets.maxPower / distance;
    dx = dx*scale;
    dy = dy*scale;
  }

  velocityX = dx * 0.2;
  velocityY = dy * 0.2;
  arrow.style.display = "none"; // hide arrow
});

const tileSize = 40;

const course = document.getElementById("course");

// G = Grass, W = Wall (horizontal), V = Wall (vertical)
const layout = [
  ['W','W','W','W','W','W','W','W','W','W'],
  ['W','S','G','G','G','G','G','G','G','W'],
  ['W','G','W','G','G','W','W','G','G','W'],
  ['W','G','W','G','G','G','W','G','W','W'],
  ['W','G','W','G','W','G','W','G','H','W'],
  ['W','G','W','G','W','G','W','G','G','W'],
];

const wallTiles = [];
let holeTile = null;
let spawnTile = null;
function createTile(type, x, y) {
  const tile = document.createElement('div');
  tile.classList.add('tile');

  if (type === 'G') tile.classList.add('grass');
  else if (type === 'W') {  tile.classList.add('wall');
wallTiles.push({ x, y });
  }else if (type === 'V') {
    tile.classList.add('wall', 'rotate');
  }else if (type === 'S') {
    tile.classList.add('grass'); // treat it like grass visually
    spawnTile = { x, y };
    spawnBallAt(x, y)
  }else if (type === 'H') {
    tile.classList.add('hole');
    holeTile = { x, y }; // track hole position
  }
  tile.style.left = `${x * tileSize}px`;
  tile.style.top = `${y * tileSize}px`;

  course.appendChild(tile);
}

function spawnBallAt(tileX, tileY) {
  const ballSize = ball.offsetWidth;
  const centerX = tileX * tileSize + tileSize / 2 - ballSize / 2;
  const centerY = tileY * tileSize + tileSize / 2 - ballSize / 2;

  ball.style.left = `${centerX}px`;
  ball.style.top = `${centerY}px`;
}

layout.forEach((row, y) => {
  row.forEach((type, x) => {
    createTile(type, x, y);
  });
});


function updateBall() {
  const currentLeft = parseFloat(ball.style.left || 0);
  const currentTop = parseFloat(ball.style.top || 0);

  const ballSize = ball.offsetWidth;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let newLeft = currentLeft + velocityX;
  let newTop = currentTop + velocityY;

  // Get center of ball for collision
  const ballCenterX = newLeft + ballSize / 2;
  const ballCenterY = newTop + ballSize / 2;

  // Convert to tile coordinates
  const tileX = Math.floor(ballCenterX / tileSize);
  const tileY = Math.floor(ballCenterY / tileSize);

  // Get proposed edges
  const nextLeft = newLeft;
  const nextTop = newTop;
  const nextRight = newLeft + ballSize;
  const nextBottom = newTop + ballSize;

  // Convert edges to tile coordinates
  const leftTile = Math.floor(nextLeft / tileSize);
  const rightTile = Math.floor(nextRight / tileSize);
  const topTile = Math.floor(nextTop / tileSize);
  const bottomTile = Math.floor(nextBottom / tileSize);

  // Track bounce per axis
  let bouncedX = false;
  let bouncedY = false;

  // Check vertical collisions (left/right)
  if (
    wallTiles.some(tile => tile.y >= topTile && tile.y <= bottomTile && tile.x === leftTile)
  ) {
    velocityX = -velocityX * 0.8; // bounce with damping
    bouncedX = true;
  }
  if (
    wallTiles.some(tile => tile.y >= topTile && tile.y <= bottomTile && tile.x === rightTile)
  ) {
    velocityX = -velocityX * 0.8;
    bouncedX = true;
  }

  // Check horizontal collisions (top/bottom)
  if (
    wallTiles.some(tile => tile.x >= leftTile && tile.x <= rightTile && tile.y === topTile)
  ) {
    velocityY = -velocityY * 0.8;
    bouncedY = true;
  }
  if (
    wallTiles.some(tile => tile.x >= leftTile && tile.x <= rightTile && tile.y === bottomTile)
  ) {
    velocityY = -velocityY * 0.8;
    bouncedY = true;
  }

  // Cancel movement in that direction if bounced
  if (bouncedX) newLeft = currentLeft;
  if (bouncedY) newTop = currentTop;


  if (holeTile && !ballJustScored) {
    const ballCenterX = newLeft + ballSize / 2;
    const ballCenterY = newTop + ballSize / 2;

    const holeCenterX = holeTile.x * tileSize + tileSize / 2;
    const holeCenterY = holeTile.y * tileSize + tileSize / 2;

    const dx = ballCenterX - holeCenterX;
    const dy = ballCenterY - holeCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance < tileSize * 0.3) {
      ballJustScored = true; // prevent multiple triggers
      money += 1;
      
      // Stop the ball immediately
      velocityX = 0;
      velocityY = 0;

      // Optional: disable shooting for now
      dragging = false;

      // Placeholder: Start win animation (e.g. fade out, scale down)
      ball.style.transition = 'transform 0.3s, opacity 0.3s';
      ball.style.transform = 'scale(0.5)';
      ball.style.opacity = '0';

      setTimeout(() => {
        // Reset ball visual state
        ball.style.transition = '';
        ball.style.transform = 'scale(1)';
        ball.style.opacity = '1';

        // Move ball to spawn
        if (spawnTile) {
          spawnBallAt(spawnTile.x, spawnTile.y);
        }

        // Allow input again
        ballJustScored = false;
      }, 400); // Delay for animation (tweak later)
    }
  }

  

  
  // Clamp to screen edges (optional or you could clamp to course)
  const courseWidth = course.offsetWidth;
  const courseHeight = course.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, courseWidth - ballSize));
  newTop = Math.max(0, Math.min(newTop, courseHeight - ballSize));

  ball.style.left = `${newLeft}px`;
  ball.style.top = `${newTop}px`;

  // Apply friction
  velocityX *= 0.95;
  velocityY *= 0.95;

  // Stop if velocity is very low
  if (Math.abs(velocityX) < 0.1) velocityX = 0;
  if (Math.abs(velocityY) < 0.1) velocityY = 0;
  document.getElementById("debug").textContent = 
    `Max power: ${upgradeTargets.maxPower} Velocity X: ${velocityX.toFixed(2)}\nVelocity Y: ${velocityY.toFixed(2)}`;
  requestAnimationFrame(updateBall);
}

requestAnimationFrame(updateBall);


document.addEventListener("mousemove", function (event) {
  if (!dragging) return;

  const dx = startX - event.clientX;
  const dy = startY - event.clientY;
  const distance = Math.min(Math.hypot(dx, dy), upgradeTargets.maxPower);

  const angle = Math.atan2(dy, dx); // radians

  // Position arrow at ball center
  const ballX = parseFloat(ball.style.left || 0) + ball.offsetWidth / 2;
  const ballY = parseFloat(ball.style.top || 0) + ball.offsetHeight / 2;

  arrow.style.left = `${ballX}px`;
  arrow.style.top = `${ballY}px`;
  arrow.style.width = `${distance}px`;
  arrow.style.transform = `rotate(${angle}rad)`;
});


// --- data/upgrades.js --- (near top, before logic runs)

const upgrades = [
  {
    id: "maxPowerBoost",
    name: "Increase Max Power",
    description: "Increases max shot power.",
    effect: {
      target: "maxPower",
      type: "multiply",
      value: 1.3,
      prefix: "×",
      suffix: " Max Power"
    },
    cost: {
      currency: "money",
      amount: 5,
      multiplier: 1.5,
      prefix: "$",
      suffix: ""
    },
    maxLevel: 3,
    requirements: {
      upgrades: [],
      unlocks: []
    },
    fallback: null
  },
  {
    id: "moveSpeedBoost",
    name: "Speed Shoes",
    description: "Increases ball movement speed by 20%.",
    effect: {
      target: "ballSpeed",
      type: "multiply",
      value: 1.2,
      prefix: "×",
      suffix: " Ball Speed"
    },
    cost: {
      currency: "money",
      amount: 15,
      multiplier: 2,
      prefix: "$",
      suffix: ""
    },
    maxLevel: 5,
    requirements: {
      upgrades: ["maxPowerBoost"],
      unlocks: []
    },
    fallback: null
  }
];

function applyUpgradeEffect(upg) {
  const { target, type, value } = upg.effect;
  if (!upgradeTargets.hasOwnProperty(target)) return;

  if (type === "multiply") {
    upgradeTargets[target] *= value;
  } else if (type === "increment") {
    upgradeTargets[target] += value;
  }
}

function getUpgradeCost(upg) {
  const level = game.persist.upgrades[upg.id] || 0;
  return Math.ceil(upg.cost.amount * Math.pow(upg.cost.multiplier, level));
}
function buildShop(containerId = "shop") {
  const shop = document.getElementById(containerId);

  upgrades.forEach(upg => {
    const btn = document.createElement("button");
    btn.className = "shop-button";
    btn.id = `upgrade-${upg.id}`;
    shop.appendChild(btn);

    btn.addEventListener("click", () => {
      const level = game.persist.upgrades[upg.id] || 0;
      const cost = getUpgradeCost(upg);
      const currency = upg.cost.currency;

      if (game.persist.currencies[currency] >= cost && level < upg.maxLevel) {
        game.persist.currencies[currency] -= cost;
        game.persist.upgrades[upg.id] = level + 1;

        if (typeof upg.fallback === "function") {
          upg.fallback();
        } else {
          applyUpgradeEffect(upg);
        }

        updateShop();
      }
    });
  });
}
buildShop(); // ✅ must call this!

function updateShop() {
  upgrades.forEach(upg => {
    const btn = document.getElementById(`upgrade-${upg.id}`);
    const level = game.persist.upgrades[upg.id] || 0;
    const cost = getUpgradeCost(upg);
    const currency = upg.cost.currency;
    const affordable = game.persist.currencies[currency] >= cost;

    if (level >= upg.maxLevel) {
      btn.textContent = `${upg.name} (MAXED)`;
      btn.disabled = true;
    } else {
      btn.textContent = `${upg.name} (${upg.cost.prefix}${cost}${upg.cost.suffix}) [LVL ${level}/${upg.maxLevel}]`;
      btn.disabled = !affordable;
    }
  });

  document.getElementById("money").textContent = `Money: ${game.persist.currencies.money}`;
}

function renderUI() {
  document.getElementById("money").textContent = `Money: ${money}`;
  updateShop(); // ✅ update button states every frame
  // other UI updates here
  requestAnimationFrame(renderUI);
}
renderUI();

