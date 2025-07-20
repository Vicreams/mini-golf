// === ball.js ===

// --- DOM References ---
let ball = null;
let arrow = null;
let powerIndicator = null;

// --- Ball State ---
let dragging = false;
let startX = 0;
let startY = 0;
let velocityX = 0;
let velocityY = 0;
let ballJustScored = false;

// --- Init ---
function initBallSystem() {
  ball = document.getElementById("ball");
  arrow = document.getElementById("arrow");
  powerIndicator = document.getElementById("power-indicator");

  if (!ball || !arrow) return;

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);

  requestAnimationFrame(updateBall);
}

// --- Spawn Ball ---
function spawnBallAt(x, y) {
  const tileSize = getTileSize();
  const ballSize = tileSize * 0.5;

  velocityX = 0;
  velocityY = 0;

  ball.style.width = `${ballSize}px`;
  ball.style.height = `${ballSize}px`;

  const px = x * tileSize + tileSize / 2 - ballSize / 2;
  const py = y * tileSize + tileSize / 2 - ballSize / 2;

  ball.style.left = `${px}px`;
  ball.style.top = `${py}px`;
}

// --- Input ---
function onMouseDown(event) {
  if (!ball || !arrow) return;

  dragging = true;
  startX = event.clientX;
  startY = event.clientY;

  arrow.style.display = "block";
  onMouseMove(event);
}

function onMouseUp(event) {
  if (!dragging) return;
  dragging = false;

  const endX = event.clientX;
  const endY = event.clientY;

  const dragScale = 0.2;
  let dx = (startX - endX) * dragScale;
  let dy = (startY - endY) * dragScale;
  let strength = Math.sqrt(dx ** 2 + dy ** 2);

  if (strength > upgradeTargets.maxPower) {
    const scale = upgradeTargets.maxPower / strength;
    dx *= scale;
    dy *= scale;
  }

  velocityX = dx * 0.2;
  velocityY = dy * 0.2;

  arrow.style.display = "none";
  if (powerIndicator) powerIndicator.style.display = "none";
}

function onMouseMove(event) {
  if (!dragging || !ball || !arrow) return;

  const dragScale = 0.2;
  const dx = startX - event.clientX;
  const dy = startY - event.clientY;

  const scaledDx = dx * dragScale;
  const scaledDy = dy * dragScale;
  const distance = Math.sqrt(scaledDx ** 2 + scaledDy ** 2);
  const angle = Math.atan2(dy, dx);

  const ballX = ball.offsetLeft + ball.offsetWidth / 2;
  const ballY = ball.offsetTop + ball.offsetHeight / 2;

  const hasBetterArrow = game.upgrades["BetterArrow"] > 0;
  const tileSize = getTileSize();

  const minArrow = hasBetterArrow ? tileSize * 0.1 : tileSize * 0.7;
  const maxArrow = tileSize * 4;
  const normalized = Math.min(distance / upgradeTargets.maxPower, 1);

  const arrowLength = hasBetterArrow
    ? minArrow + normalized * (maxArrow - minArrow)
    : minArrow;

  arrow.style.left = `${ballX}px`;
  arrow.style.top = `${ballY}px`;
  arrow.style.width = `${arrowLength}px`;
  arrow.style.transform = `rotate(${angle}rad)`;

  if (hasBetterArrow && powerIndicator) {
    const percent = Math.round((distance / upgradeTargets.maxPower) * 100);
    powerIndicator.textContent = `${Math.min(percent, 100)}%`;
    powerIndicator.style.left = `${ballX - 30}px`;
    powerIndicator.style.top = `${ballY + 25}px`;
    powerIndicator.style.display = "block";
  } else if (powerIndicator) {
    powerIndicator.style.display = "none";
  }
}

// --- Ball Update ---
function updateBall() {
  if (!ball) return;

  const tileSize = getTileSize();
  const courseWidth = course.offsetWidth;
  const courseHeight = course.offsetHeight;

  let friction = 0.95;

  const currentLeft = parseFloat(ball.style.left || 0);
  const currentTop = parseFloat(ball.style.top || 0);
  const ballSize = ball.offsetWidth;

  let newLeft = currentLeft + velocityX;
  let newTop = currentTop + velocityY;

  const nextLeft = newLeft;
  const nextTop = newTop;
  const nextRight = newLeft + ballSize;
  const nextBottom = newTop + ballSize;

  const leftTile = Math.floor(nextLeft / tileSize);
  const rightTile = Math.floor(nextRight / tileSize);
  const topTile = Math.floor(nextTop / tileSize);
  const bottomTile = Math.floor(nextBottom / tileSize);

  if (wallTiles.some(t => t.y >= topTile && t.y <= bottomTile && t.x === leftTile)) velocityX *= -0.8;
  if (wallTiles.some(t => t.y >= topTile && t.y <= bottomTile && t.x === rightTile)) velocityX *= -0.8;
  if (wallTiles.some(t => t.x >= leftTile && t.x <= rightTile && t.y === topTile)) velocityY *= -0.8;
  if (wallTiles.some(t => t.x >= leftTile && t.x <= rightTile && t.y === bottomTile)) velocityY *= -0.8;

  const ballCenterX = newLeft + ballSize / 2;
  const ballCenterY = newTop + ballSize / 2;
  const tileX = Math.floor(ballCenterX / tileSize);
  const tileY = Math.floor(ballCenterY / tileSize);

  const tileEl = [...course.querySelectorAll(".tile")].find(t => {
    const tx = parseInt(t.style.left) / tileSize;
    const ty = parseInt(t.style.top) / tileSize;
    return tx === tileX && ty === tileY;
  });

  if (tileEl) {
    if (tileEl.dataset.conveyor) {
      const conveyorForce = 0.3;
      switch (tileEl.dataset.conveyor) {
        case "right": velocityX += conveyorForce; break;
        case "left": velocityX -= conveyorForce; break;
        case "up": velocityY -= conveyorForce; break;
        case "down": velocityY += conveyorForce; break;
      }
    }

    if (tileEl.classList.contains("ice")) {
      friction = 0.98;
    }

    if (tileEl.classList.contains("water")) {
      velocityX = 0;
      velocityY = 0;
      dragging = false;

      ball.style.transition = 'transform 0.3s, opacity 0.3s';
      ball.style.transform = 'scale(0.5)';
      ball.style.opacity = '0';

      setTimeout(() => {
        ball.style.transition = '';
        ball.style.transform = 'scale(1)';
        ball.style.opacity = '1';
        if (spawnTile) spawnBallAt(spawnTile.x, spawnTile.y);
        requestAnimationFrame(updateBall); // <- ✅ RESUME
      }, 400);
      return;
    }
  }

  if (holeTile && !ballJustScored) {
    const holeCenterX = holeTile.x * tileSize + tileSize / 2;
    const holeCenterY = holeTile.y * tileSize + tileSize / 2;
    const dx = ballCenterX - holeCenterX;
    const dy = ballCenterY - holeCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < tileSize * 0.3) {
      ballJustScored = true;
      velocityX = 0;
      velocityY = 0;
      dragging = false;

      ball.style.transition = "transform 0.3s, opacity 0.3s";
      ball.style.transform = "scale(0.5)";
      ball.style.opacity = "0";

      setTimeout(() => {
        ball.style.transition = "";
        ball.style.transform = "scale(1)";
        ball.style.opacity = "1";
        if (spawnTile) spawnBallAt(spawnTile.x, spawnTile.y);
        ballJustScored = false;
        requestAnimationFrame(updateBall); // <- ✅ RESUME
      }, 400);
      return;
    }
  }

  newLeft = Math.max(0, Math.min(newLeft, courseWidth - ballSize));
  newTop = Math.max(0, Math.min(newTop, courseHeight - ballSize));

  ball.style.left = `${newLeft}px`;
  ball.style.top = `${newTop}px`;

  velocityX *= friction;
  velocityY *= friction;

  if (Math.abs(velocityX) < 0.1) velocityX = 0;
  if (Math.abs(velocityY) < 0.1) velocityY = 0;

  requestAnimationFrame(updateBall);
}

// --- Visual Upgrade ---
function applyBallVisualsFromUpgrades() {
  if (!ball) return;
  const level = game.upgrades["maxPowerBoost"] || 0;
  ball.style.borderRadius = level === 0 ? "0%" : level === 1 ? "20%" : "50%";
}