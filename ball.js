// === ball.js ===

let ball = null;
let arrow = null;
let powerIndicator = null;
window.masksReady = false;

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

  if (!ball || !arrow) {
    console.error("❌ initBallSystem: DOM elements missing. Retrying in 100ms...");
    setTimeout(initBallSystem, 100); // 🔁 Try again shortly
    return;
  }

  console.log("✅ Ball system initialized");

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);

  requestAnimationFrame(updateBall); // Start loop once

  if (spawnTile) {
    console.log("🎯 Spawning ball at spawn tile:", spawnTile);
    spawnBallAt(spawnTile.x, spawnTile.y);
  } else {
    console.warn("⚠️ spawnTile is null.");
  }

  window.masksReady = true;
  console.log("✅ masksReady is now true");
}

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
  window.currentLeft = px;
  window.currentTop = py;

  console.log("🔄 Spawned at:", px, py);
}

// --- Mouse ---
function onMouseDown(e) {
  if (!ball || !arrow) return;
  dragging = true;
  hasDraggedFarEnough = false;
  startX = e.clientX;
  startY = e.clientY;
}

function onMouseUp(e) {
  if (!dragging) return;
  dragging = false;

  
  if (!hasDraggedFarEnough || (Date.now() - lastShotTime) < upgradeTargets.shotCooldown) {
    arrow.style.display = "none";
    if (powerIndicator) powerIndicator.style.display = "none";
    return; // not a real drag
  }
  
  lastShotTime=Date.now()
  const dragScale = 0.2;
  let dx = (startX - e.clientX) * dragScale;
  let dy = (startY - e.clientY) * dragScale;

  const strength = Math.hypot(dx, dy);
  const max = upgradeTargets.maxPower;

  if (strength > max) {
    const scale = max / strength;
    dx *= scale;
    dy *= scale;
  }

  velocityX = dx * 0.2;
  velocityY = dy * 0.2;

  console.log("🏌️ Shot fired with velocity", velocityX, velocityY);

  arrow.style.display = "none";
  if (powerIndicator) powerIndicator.style.display = "none";

  window.currentLeft = parseFloat(ball.style.left || 0);
  window.currentTop = parseFloat(ball.style.top || 0);
}



function onMouseMove(e) {
  if (!dragging) return;

  const dx = startX - e.clientX;
  const dy = startY - e.clientY;
  const distance = Math.hypot(dx, dy);
  
  if (!hasDraggedFarEnough && distance >= 5 && (Date.now() - lastShotTime) >= upgradeTargets.shotCooldown) {
    hasDraggedFarEnough = true;
    arrow.style.display = "block";
  }

  if (!hasDraggedFarEnough) return; // don't update arrow if not dragged enough yet

  const angle = Math.atan2(dy, dx);
  const tileSize = getTileSize();

  const ballX = ball.offsetLeft + ball.offsetWidth / 2;
  const ballY = ball.offsetTop + ball.offsetHeight / 2;

  const hasBetterArrow = game.upgrades["BetterArrow"] > 0;
  const min = hasBetterArrow ? tileSize * 0.1 : tileSize * 0.7;
  const max = tileSize * 4;
  const powerRatio = Math.min(distance / upgradeTargets.maxPower, 1);
  const arrowLength = hasBetterArrow ? min + powerRatio * (max - min) : min;

  arrow.style.left = `${ballX}px`;
  arrow.style.top = `${ballY}px`;
  arrow.style.width = `${arrowLength}px`;
  arrow.style.transform = `rotate(${angle}rad)`;

  if (hasBetterArrow && powerIndicator) {
    powerIndicator.textContent = `${Math.round(powerRatio * 100)}%`;
    powerIndicator.style.left = `${ballX - 30}px`;
    powerIndicator.style.top = `${ballY + 25}px`;
    powerIndicator.style.display = "block";
  } else {
    if (powerIndicator) powerIndicator.style.display = "none";
  }
}

// --- Collision Helper ---
function isOverlapping(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// --- Main Update Loop ---
function updateBall() {
  if (!gameVisible) {
    requestAnimationFrame(updateBall);
    return; }
  const tileSize = getTileSize();
  const courseWidth = course.offsetWidth;
  const courseHeight = course.offsetHeight;

  let friction = 0.95;

  const currentLeft = parseFloat(ball.style.left || 0);
  const currentTop = parseFloat(ball.style.top || 0);
  const ballSize = ball.offsetWidth;

  let newLeft = currentLeft + velocityX;
  let newTop = currentTop + velocityY;

  const leftTile = Math.floor(newLeft / tileSize);
  const rightTile = Math.floor((newLeft + ballSize) / tileSize);
  const topTile = Math.floor(newTop / tileSize);
  const bottomTile = Math.floor((newTop + ballSize) / tileSize);


  if (!window.masksReady) {
    requestAnimationFrame(updateBall);
    return;
  }

  document.querySelectorAll("canvas.overlay-mask").forEach(mask => {
    const type = mask.dataset.type;
    const ctx = mask.getContext("2d");

    const maskBounds = mask.getBoundingClientRect();
    const ballBounds = ball.getBoundingClientRect();

    // Compute ball center relative to screen
    const screenX = ballBounds.left + ballBounds.width / 2;
    const screenY = ballBounds.top + ballBounds.height / 2;

    // Compute that point relative to the canvas's pixel space
    const localX = (screenX - maskBounds.left) * (mask.width / maskBounds.width);
    const localY = (screenY - maskBounds.top) * (mask.height / maskBounds.height);

    const inBounds =
      localX >= 0 &&
      localY >= 0 &&
      localX < mask.width &&
      localY < mask.height;

    if (!inBounds) return; // Ball center not inside this mask

    // Sample 1 pixel at ball center
    const pixel = ctx.getImageData(Math.floor(localX), Math.floor(localY), 1, 1).data;
    const [r, g, b, a] = pixel;

    const isBlack = r === 0 && g === 0 && b === 0 && a === 255;

    if (isBlack) {
      if (type === "water") {
        console.log("💧 Water mask triggered — resetting ball.");
        resetBall();
      } else if (type === "ice") {
        friction = 0.975;
      } else if (type === "sand") {
        friction = upgradeTargets.sandFriction;
      } else if (type === "deco") {
        const img = mask.linkedImage;

        if (img && img.isConnected) {
          img.remove();

          setTimeout(() => {
            course.appendChild(img);
          }, 10000); // Respawn after 10s

          // Apply slight bounce-back with randomness
          const bounceFactor = -0.7 + (Math.random() - 0.5) * 0.6;
          velocityX *= bounceFactor;
          velocityY *= bounceFactor;

          console.log("🌳 Deco object hit: removed and bounced.");
        }
      }
      
    }
  });
  
  // Wall bounce
  const ballBounds = {
    left: newLeft,
    right: newLeft + ballSize,
    top: newTop,
    bottom: newTop + ballSize,
  };

  for (const wall of wallTiles) {
    const wallLeft = wall.x * tileSize;
    const wallTop = wall.y * tileSize;
    const wallBounds = {
      left: wallLeft,
      right: wallLeft + tileSize,
      top: wallTop,
      bottom: wallTop + tileSize,
    };

    const intersectX =
      ballBounds.left < wallBounds.right &&
      ballBounds.right > wallBounds.left;
    const intersectY =
      ballBounds.top < wallBounds.bottom &&
      ballBounds.bottom > wallBounds.top;

    if (intersectX && intersectY) {
      // Compute overlap in X and Y
      const overlapX =
        Math.min(ballBounds.right, wallBounds.right) -
        Math.max(ballBounds.left, wallBounds.left);
      const overlapY =
        Math.min(ballBounds.bottom, wallBounds.bottom) -
        Math.max(ballBounds.top, wallBounds.top);

      if (overlapX < overlapY) {
        // Bounce horizontally
        velocityX *= -0.8;
        newLeft += velocityX > 0 ? overlapX : -overlapX;
      } else {
        // Bounce vertically
        velocityY *= -0.8;
        newTop += velocityY > 0 ? overlapY : -overlapY;
      }

      break; // bounce once per frame max
    }
  }
  
  // Tile detection
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
      const f = 0.3;
      switch (tileEl.dataset.conveyor) {
        case "right": velocityX += f; break;
        case "left": velocityX -= f; break;
        case "up": velocityY -= f; break;
        case "down": velocityY += f; break;
      }
    }
    if (tileEl.classList.contains("ice")) friction = 0.98;
    if (tileEl.classList.contains("water")) return resetBall(); // TILE water
    const key = `${tileX},${tileY}`;
    if (activeTees && activeTees.has(key)) {
      const tee = activeTees.get(key);
      tee.remove();
      activeTees.delete(key);
      game.currencies.money += 1;
      console.log("💰 Tee collected at", key, "Money +1");
    }
  }

  // Hole detection
  if (holeTile && !ballJustScored) {
    const holeCenterX = holeTile.x * tileSize + tileSize / 2;
    const holeCenterY = holeTile.y * tileSize + tileSize / 2;
    const dx = ballCenterX - holeCenterX;
    const dy = ballCenterY - holeCenterY;
    const dist = Math.hypot(dx, dy);
    // Hide the flag when ball is close
    const flagElement = document.querySelector(".flag-wrapper");
    if (flagElement) {
      if (dist < tileSize * 1.5) {
        flagElement.style.opacity = "0";
      } else {
        flagElement.style.opacity = "1";
      }
    }
    if (dist < tileSize * 0.3) {
      ballJustScored = true;
      velocityX = velocityY = 0;
      dragging = false;
      game.currencies.money += upgradeTargets.holeMoney;

      ball.style.transition = "transform 0.3s, opacity 0.3s";
      ball.style.transform = "scale(0.5)";
      ball.style.opacity = "0";

      setTimeout(() => {
        ball.style.transition = "";
        ball.style.transform = "scale(1)";
        ball.style.opacity = "1";
        if (spawnTile) spawnBallAt(spawnTile.x, spawnTile.y);
        ballJustScored = false;
      }, 400);
    }
  }

  // Clamp and move
  newLeft = Math.max(0, Math.min(newLeft, courseWidth - ballSize));
  newTop = Math.max(0, Math.min(newTop, courseHeight - ballSize));

  ball.style.left = `${newLeft}px`;
  ball.style.top = `${newTop}px`;

  velocityX *= friction;
  velocityY *= friction;

  if (Math.abs(velocityX) < 0.1) velocityX = 0;
  if (Math.abs(velocityY) < 0.1) velocityY = 0;

  requestAnimationFrame(updateBall);
  updateSpinRing()
  
}

// --- Ball Kill ---
function resetBall() {
  console.warn("💧 Ball reset from water");
  velocityX = velocityY = 0;
  dragging = false;

  ball.style.transition = 'transform 0.3s, opacity 0.3s';
  ball.style.transform = 'scale(0.5)';
  ball.style.opacity = '0';

  setTimeout(() => {
    ball.style.transition = '';
    ball.style.transform = 'scale(1)';
    ball.style.opacity = '1';
    if (game.unlocks["waterForgiveness"] && window.currentLeft != null && window.currentTop != null) {
      ball.style.left = `${window.currentLeft}px`;
      ball.style.top = `${window.currentTop}px`;
      console.log("🔁 Respawned at last position due to upgrade");
    } else {
      if (spawnTile) spawnBallAt(spawnTile.x, spawnTile.y);
    }
  }, 400);
}

// Spinning ring
function updateSpinRing() {
  const ballX = ball.offsetLeft + ball.offsetWidth / 2;
  const ballY = ball.offsetTop + ball.offsetHeight / 2;

  // Position it at ball center
  spinRing.style.left = `${ballX - spinRing.offsetWidth / 2}px`;
  spinRing.style.top = `${ballY - spinRing.offsetHeight / 2}px`;

  const cooldownReady = (Date.now() - lastShotTime) >= upgradeTargets.shotCooldown;

  if (!dragging && cooldownReady) {
    spinRing.style.opacity = "1";
    } else {
    spinRing.style.opacity = "0";
  }
}

// --- Visual Upgrade ---
function applyBallVisualsFromUpgrades() {
  if (!ball) return;
  const level = game.upgrades["maxPowerBoost"] || 0;
  ball.style.borderRadius = level === 0 ? "0%" : level === 1 ? "20%" : "50%";
}