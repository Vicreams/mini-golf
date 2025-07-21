// === terrain.js ===

// --- DOM References ---
const course = document.getElementById("course");

// --- Tile Size Management ---
let currentTileSize = 40;

function setTileSize(size) {
  currentTileSize = size;
}

function getTileSize() {
  return currentTileSize;
}

// --- Level Definitions ---
const levels = [
  {
    name: "Tutorial",
    tileSize: 40,
    layout: [
      "WWWWWWWWWWW",
      "WGGGGGGGGGW",
      "WGGGGGGGGGW",
      "WSG>>GGGGHW",
      "WGGGGGGGGGW",
      "WGGGGGGGGGW",
      "WWWWWWWWWWW"
    ],
    overlays: [
      {
        type: "water",
        image: "pond1.png",         // visible image
        mask: "pond1-mask.png",     // black/white mask
        x: 5, y: 1, w: 4, h: 4
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

// --- Map Generation ---
function generateMap(level) {
  const numRows = level.layout.length;
  const numCols = level.layout[0].length;

  const maxWidth = 450;
  const maxHeight = 300;

  const tileSize = Math.floor(Math.min(maxWidth / numCols, maxHeight / numRows));
  setTileSize(tileSize);

  course.style.width = `${tileSize * numCols}px`;
  course.style.height = `${tileSize * numRows}px`;

  [...course.querySelectorAll(".tile")].forEach(el => el.remove());

  wallTiles.length = 0;
  holeTile = null;
  spawnTile = null;

  level.layout.forEach((row, y) => {
    [...row].forEach((char, x) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      if (char === "W") {
        tile.classList.add("wall");
        wallTiles.push({ x, y });
      } else if (char === "G" || char === "S") {
        tile.classList.add("grass");
        if (char === "S") spawnTile = { x, y };
      } else if (char === "I") {
        tile.classList.add("ice");
      } else if (char === "H") {
        tile.classList.add("hole");
        holeTile = { x, y };
      } else if (char === "Q") {
        tile.classList.add("water");
      } else if ("><^v".includes(char)) {
        tile.classList.add("conveyor");

        let direction = null;
        switch (char) {
          case ">": direction = "right"; break;
          case "<": direction = "left";  tile.style.transform = "rotate(180deg)"; break;
          case "^": direction = "up";    tile.style.transform = "rotate(-90deg)"; break;
          case "v": direction = "down";  tile.style.transform = "rotate(90deg)"; break;
        }

        tile.dataset.conveyor = direction;
        tile.classList.add("conveyor", "grass");
      }

      tile.style.left = `${x * tileSize}px`;
      tile.style.top = `${y * tileSize}px`;
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;

      course.appendChild(tile);
    });
  });

  // === Overlay mask and image loading ===
  const overlays = level.overlays || [];
  let loadedCount = 0;

  if (overlays.length === 0) {
    initBallSystem(); // ✅ Start immediately if no overlays
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

    if (overlay.mask) {
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
      canvas.style.opacity = "0"; // ✅ show visibly
      canvas.style.zIndex = "-1"; // ✅ show over pond image
      canvas.dataset.type = overlay.type;

      const ctx = canvas.getContext("2d");

      const imgEl = new Image();
      imgEl.src = overlay.mask;

      imgEl.onload = () => {
        ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

        // ✅ Draw magenta border so you see where the mask is
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // ✅ Log sample pixel at center
        const centerSample = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
        console.log("🔍 Center pixel of mask canvas:", centerSample);

        loadedCount++;
        console.log(`✅ Mask loaded: ${overlay.mask}`);

        if (loadedCount === overlays.length) {
          console.log("🎯 All overlay masks loaded. Initializing ball system.");
          window.masksReady = true;
          initBallSystem();
          if (spawnTile) {
            spawnBallAt(spawnTile.x, spawnTile.y);
          } else {
            console.warn("⚠️ No spawn tile defined in level!");
          }
        }
      };

      imgEl.onerror = () => {
        console.error("❌ Failed to load mask image:", overlay.mask);
      };

      course.appendChild(canvas);
    }
  });

}