// === ball.js ===

// --- DOM References ---
const ball = document.getElementById("ball");
const arrow = document.getElementById("arrow");

// --- State ---
let velocityX = 0;
let velocityY = 0;
let ballJustScored = false;

let shootingPhase = 'direction'; // 'direction', 'strength', or 'idle'
let currentAngle = 0;
let currentStrength = 0;
let directionOscillation = 0;
let strengthOscillation = 0;
let directionIncreasing = true;
let strengthIncreasing = true;

// --- Visual Scaling ---
const strengthVisualMin = 20; // in px, visual size for strength = 1
const strengthVisualPerPower = 4; // multiplier per power unit (adjustable)

const directionArrowSize = (upgradeTargets.maxPower - 1) * strengthVisualPerPower + strengthVisualMin;

// --- Config for Upgrades ---
const shootConfig = {
  direction: {
    manual: false,
    speed: 0.02, // radians per frame
    range: Math.PI // Full 180 degrees (-90 to +90)
  },
  strength: {
    manual: false,
    speed: 1.5, // pixels per frame
    oscillationDuration: 1500,
    min: 1,
    max: upgradeTargets.maxPower
  }
};



// --- Input: Spacebar for Confirming Phase ---
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (shootingPhase === 'direction') {
      shootingPhase = 'strength';
      animateStrengthArrow();
    } else if (shootingPhase === 'strength') {
      launchBall(currentAngle, currentStrength);
      shootingPhase = 'idle';
      arrow.style.display = "none";
    }
  }
});

// --- Direction Arrow Oscillation ---
function animateDirectionArrow() {
  if (shootingPhase !== 'direction') return;
  arrow.style.display = "block";
  const ballCenterX = parseFloat(ball.style.left || 0) + ball.offsetWidth / 2;
  const ballCenterY = parseFloat(ball.style.top || 0) + ball.offsetHeight / 2;

  // Direction oscillates between -range/2 and +range/2
  if (directionIncreasing) {
    directionOscillation += shootConfig.direction.speed;
    if (directionOscillation >= shootConfig.direction.range / 2) {
      directionIncreasing = false;
    }
  } else {
    directionOscillation -= shootConfig.direction.speed;
    if (directionOscillation <= -shootConfig.direction.range / 2) {
      directionIncreasing = true;
    }
  }

  currentAngle = directionOscillation;

  arrow.style.left = `${ballCenterX}px`;
  arrow.style.top = `${ballCenterY}px`;
  arrow.style.width = `${directionArrowSize}px`;
  arrow.style.transform = `rotate(${currentAngle}rad)`;

  requestAnimationFrame(animateDirectionArrow);
}

// --- Strength Arrow Oscillation ---
function animateStrengthArrow() {
  if (shootingPhase !== 'strength') return;

  const ballCenterX = parseFloat(ball.style.left || 0) + ball.offsetWidth / 2;
  const ballCenterY = parseFloat(ball.style.top || 0) + ball.offsetHeight / 2;

  const now = performance.now();

  const duration = shootConfig.strength.oscillationDuration;
  const progress = (now % duration) / duration; // goes from 0 → 1 in a cycle

  // Oscillate strength between min and max using sine wave
  const sinValue = 1-(Math.sin(progress * 2 * Math.PI) * 0.5 + 0.5); // maps to [0, 1]
  currentStrength = shootConfig.strength.min + sinValue * (shootConfig.strength.max - shootConfig.strength.min);
  console.log(currentStrength)
  // Visual size
  const normalized = (currentStrength - shootConfig.strength.min) / (shootConfig.strength.max - shootConfig.strength.min);
  const visualWidth = strengthVisualMin + normalized * (directionArrowSize - strengthVisualMin);

  arrow.style.left = `${ballCenterX}px`;
  arrow.style.top = `${ballCenterY}px`;
  arrow.style.width = `${visualWidth}px`;
  arrow.style.transform = `rotate(${currentAngle}rad)`;

  requestAnimationFrame(animateStrengthArrow);
}

// --- Launch the Ball ---
function launchBall(angle, strength) {
  velocityX = Math.cos(angle) * strength * 0.2;
  velocityY = Math.sin(angle) * strength * 0.2;
}

//function spawnBallAt(tileX, tileY) {
  const ballSize = ball.offsetWidth;
  const centerX = tileX * tileSize + tileSize / 2 - ballSize / 2;
  const centerY = tileY * tileSize + tileSize / 2 - ballSize / 2;
  ball.style.left = `${centerX}px`;
  ball.style.top = `${centerY}px`;
}


// --- Main Ball Update Loop ---
function updateBall() {
  const currentLeft = parseFloat(ball.style.left || 0);
  const currentTop = parseFloat(ball.style.top || 0);
  const ballSize = ball.offsetWidth;

  let newLeft = currentLeft + velocityX;
  let newTop = currentTop + velocityY;

  const ballCenterX = newLeft + ballSize / 2;
  const ballCenterY = newTop + ballSize / 2;
  const tileX = Math.floor(ballCenterX / tileSize);
  const tileY = Math.floor(ballCenterY / tileSize);

  const nextLeft = newLeft;
  const nextTop = newTop;
  const nextRight = newLeft + ballSize;
  const nextBottom = newTop + ballSize;

  const leftTile = Math.floor(nextLeft / tileSize);
  const rightTile = Math.floor(nextRight / tileSize);
  const topTile = Math.floor(nextTop / tileSize);
  const bottomTile = Math.floor(nextBottom / tileSize);

  let bouncedX = false;
  let bouncedY = false;

  // --- Wall Collisions ---
  if (wallTiles.some(tile => tile.y >= topTile && tile.y <= bottomTile && tile.x === leftTile)) {
    velocityX = -velocityX * 0.8;
    bouncedX = true;
  }
  if (wallTiles.some(tile => tile.y >= topTile && tile.y <= bottomTile && tile.x === rightTile)) {
    velocityX = -velocityX * 0.8;
    bouncedX = true;
  }
  if (wallTiles.some(tile => tile.x >= leftTile && tile.x <= rightTile && tile.y === topTile)) {
    velocityY = -velocityY * 0.8;
    bouncedY = true;
  }
  if (wallTiles.some(tile => tile.x >= leftTile && tile.x <= rightTile && tile.y === bottomTile)) {
    velocityY = -velocityY * 0.8;
    bouncedY = true;
  }

  if (bouncedX) newLeft = currentLeft;
  if (bouncedY) newTop = currentTop;

  // --- Hole Detection ---
  if (holeTile && !ballJustScored) {
    const holeCenterX = holeTile.x * tileSize + tileSize / 2;
    const holeCenterY = holeTile.y * tileSize + tileSize / 2;
    const dx = ballCenterX - holeCenterX;
    const dy = ballCenterY - holeCenterY;
    const distance = Math.hypot(dx, dy);

    if (distance < tileSize * 0.3) {
      ballJustScored = true;
      game.currencies.money += 1
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

        if (spawnTile) {
          spawnBallAt(spawnTile.x, spawnTile.y);
        }

        ballJustScored = false;
      }, 400);
    }
  }

  // --- Clamp and Apply Movement ---
  const courseWidth = course.offsetWidth;
  const courseHeight = course.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, courseWidth - ballSize));
  newTop = Math.max(0, Math.min(newTop, courseHeight - ballSize));

  ball.style.left = `${newLeft}px`;
  ball.style.top = `${newTop}px`;

  // --- Friction & Stop ---
  velocityX *= 0.95;
  velocityY *= 0.95;

  if (Math.abs(velocityX) < 0.1) velocityX = 0;
  if (Math.abs(velocityY) < 0.1) velocityY = 0;
  if (velocityX === 0 && velocityY === 0 && shootingPhase === 'idle') {
    shootingPhase = 'direction';
    animateDirectionArrow();
  }
  requestAnimationFrame(updateBall);
}

// --- Start the Loop ---
requestAnimationFrame(updateBall);
animateDirectionArrow();