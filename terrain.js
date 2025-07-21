// === terrain.js ===

// --- DOM References ---
const course = document.getElementById("course");

// --- Tile Size Management ---
let currentTileSize = 40;
function setTileSize(size) { currentTileSize = size; }
function getTileSize() { return currentTileSize; }

// --- Level Definitions ---
const levels = [
  {
    name: "Tutorial",
    tileSize: 40,
    layout: [
      "WWWWWWWWWWW",
      "WHTTTGGGGGW",
      "WGTGTGGGGGW",
      "WSGGGGGGGGW",
      "WGTTTGGGGGW",
      "WGTTTGGGGGW",
      "WWWWWWWWWWW"
    ],
    overlays: [
      {
        type: "water",
        image: "pond1.png",
        mask: "pond1-mask.png",
        x: 6, y: 3, w: 3, h: 3
      },
      {
        type: "sand",
        image: "bunker1.png",
        mask: "bunker1-mask.png",
        x: 4, y: 1, w: 3, h: 3
      },
      {
        type: "ice",
        image: "ice1.png",
        mask: "ice1-mask.png",
        x: 2, y: 3, w: 4, h: 4
      },
      {
        type: "deco",
        image: "tree1.png",
        mask: "tree1-mask.png",
        x: 2, y: 1, w: 1, h: 1
      }
    ]
  },
  {
    name: "Shrunk Chaos",
    tileSize: 20,
    layout: [
      "WWWWWWWWWWWWWW",
      "WGGGGGGGGGGGGW",
      "WSGWGWGWGWGGHW",
      "WWWWWWWWWWWWWW"
    ]
  }
];

// --- Tile & Level State ---
const wallTiles = [];
let holeTile = null;
let spawnTile = null;
const teeSpawnTiles = [];
let teeSpawnChance = 0.1;
const activeTees = new Map();
let teeSpawnInterval = null;

// --- Tee spawning ---
function startTeeSpawning() {
  if (teeSpawnInterval) clearInterval(teeSpawnInterval);
  teeSpawnInterval = setInterval(() => {
    const tileSize = getTileSize();
    teeSpawnTiles.forEach(spot => {
      const key = `${spot.x},${spot.y}`;
      if (activeTees.has(key)) return;
      if (Math.random() < teeSpawnChance) {
        const teeImg = document.createElement("img");
        teeImg.src = "tee.png";
        teeImg.className = "tee";
        teeImg.style.position = "absolute";
        teeImg.style.left = `${spot.x * tileSize}px`;
        teeImg.style.top = `${spot.y * tileSize}px`;
        teeImg.style.width = `${tileSize}px`;
        teeImg.style.height = `${tileSize}px`;
        teeImg.style.zIndex = 5;
        course.appendChild(teeImg);
        activeTees.set(key, teeImg);
      }
    });
  }, upgradeTargets.teeSpeed);
}

// --- Map Generation ---
function generateMap(level) {
  const numRows = level.layout.length;
  const numCols = level.layout[0].length;
  const maxWidth = 450, maxHeight = 300;
  const tileSize = Math.floor(Math.min(maxWidth / numCols, maxHeight / numRows));
  setTileSize(tileSize);

  course.style.width = `${tileSize * numCols}px`;
  course.style.height = `${tileSize * numRows}px`;
  [...course.querySelectorAll(".tile")].forEach(el => el.remove());

  wallTiles.length = 0;
  teeSpawnTiles.length = 0;
  activeTees.clear();
  holeTile = null;
  spawnTile = null;

  level.layout.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (char === "W") {
        tile.classList.add("wall");
        wallTiles.push({ x, y });
      } else if ("GST".includes(char)) {
        tile.classList.add("grass");
        if (char === "S") spawnTile = { x, y };
        if (char === "T") teeSpawnTiles.push({ x, y });
      } else if (char === "I") {
        tile.classList.add("ice");
      } else if (char === "H") {
        // First tile: grass base
        const grassTile = document.createElement("div");
        grassTile.classList.add("tile", "grass");
        grassTile.style.left = `${x * tileSize}px`;
        grassTile.style.top = `${y * tileSize}px`;
        grassTile.style.width = `${tileSize}px`;
        grassTile.style.height = `${tileSize}px`;
        course.appendChild(grassTile);

        // Second tile: hole on top
        tile.classList.add("hole");
        holeTile = { x, y };
        // Create and append the flag image
        const flagWrapper = document.createElement("div");
        flagWrapper.className = "flag-wrapper";
        flagWrapper.style.position = "absolute";
        flagWrapper.style.left = `${x * tileSize}px`;
        flagWrapper.style.top = `${y * tileSize}px`;
        flagWrapper.style.width = `${tileSize}px`;
        flagWrapper.style.height = `${tileSize}px`;

        const flag = document.createElement("img");
        flag.src = "flag.png";
        flag.className = "flag";

        flagWrapper.appendChild(flag);
        course.appendChild(flagWrapper);
        
      } else if (char === "Q") {
        tile.classList.add("water");
      } else if ("><^v".includes(char)) {
        tile.classList.add("conveyor", "grass");
        let direction = { ">": "right", "<": "left", "^": "up", "v": "down" }[char];
        tile.dataset.conveyor = direction;
        tile.style.transform = {
          ">": "none", "<": "rotate(180deg)", "^": "rotate(-90deg)", "v": "rotate(90deg)"
        }[char];
      }

      tile.style.left = `${x * tileSize}px`;
      tile.style.top = `${y * tileSize}px`;
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
      course.appendChild(tile);
    });
  });

  const overlays = level.overlays || [];
  let loadedCount = 0;

  if (overlays.length === 0) {
    initBallSystem();
    return;
  }

  overlays.forEach(overlay => {
    const tileSize = getTileSize();

    const img = document.createElement("img");
    img.src = overlay.image;
    img.className = "overlay-image";
    img.style.left = `${overlay.x * tileSize}px`;
    img.style.top = `${overlay.y * tileSize}px`;
    img.style.width = `${overlay.w * tileSize}px`;
    img.style.height = `${overlay.h * tileSize}px`;
    img.dataset.type = overlay.type;
    course.appendChild(img);
    

    if (!overlay.mask) return;

    const canvas = document.createElement("canvas");
    const w = overlay.w * tileSize;
    const h = overlay.h * tileSize;

    canvas.width = w;
    canvas.height = h;
    canvas.className = "overlay-mask";
    canvas.style.position = "absolute";
    canvas.style.left = `${overlay.x * tileSize}px`;
    canvas.style.top = `${overlay.y * tileSize}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.opacity = "0";
    canvas.style.zIndex = "-1";
    canvas.dataset.type = overlay.type;
    canvas.linkedImage = img;
    
    const ctx = canvas.getContext("2d");
    const imgEl = new Image();
    imgEl.src = overlay.mask;

    imgEl.onload = () => {
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

      // 🧪 Debug border + log
      ctx.strokeStyle = "magenta";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      console.log(`✅ Mask loaded: ${overlay.mask}`);

      // 🧠 Register mask canvas by type for use elsewhere (e.g., ball.js)
      if (!window.terrainMasks) window.terrainMasks = {};
      if (!window.terrainMasks[overlay.type]) window.terrainMasks[overlay.type] = [];
      window.terrainMasks[overlay.type].push({ canvas, x: overlay.x, y: overlay.y });

      loadedCount++;
      if (loadedCount === overlays.length) {
        console.log("🎯 All overlay masks loaded. Initializing ball system.");
        window.masksReady = true;
        initBallSystem();
        if (spawnTile) {
          spawnBallAt(spawnTile.x, spawnTile.y);
          startTeeSpawning();
        } else {
          console.warn("⚠️ No spawn tile defined in level!");
        }
      }
    };

    imgEl.onerror = () => {
      console.error("❌ Failed to load mask image:", overlay.mask);
    };

    course.appendChild(canvas);
  });
}