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
      "WGGGG>GGGGW",
      "WGGGGWGGGGW",
      "WSGQQWGGGHW",
      "WGGvGWGGGGW",
      "WGGGGGGGGGW",
      "WWWWWWWWWWW"
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

  // Resize course
  course.style.width = `${tileSize * numCols}px`;
  course.style.height = `${tileSize * numRows}px`;

  // ✅ Clear only tile elements, not ball or arrow
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
      } 
      else if (char === "G" || char === "S") {
        tile.classList.add("grass");
        if (char === "S") spawnTile = { x, y };
      }
      else if (char === "I") {
        tile.classList.add("ice");
      }
      else if (char === "H") {
        tile.classList.add("hole");
        holeTile = { x, y };
      }
      else if (char === "Q") {
        tile.classList.add("water");
      }
      else if ("><^v".includes(char)) {
        tile.classList.add("conveyor");

        let direction = null;
        switch (char) {
          case ">": direction = "right"; break;
          case "<": direction = "left";  tile.style.transform = "rotate(180deg)"; break;
          case "^": direction = "up";    tile.style.transform = "rotate(-90deg)"; break;
          case "v": direction = "down";  tile.style.transform = "rotate(90deg)"; break;
        }

        tile.dataset.conveyor = direction;
        tile.classList.add("conveyor", "grass"); // conveyor is walkable
      }

      tile.style.left = `${x * tileSize}px`;
      tile.style.top = `${y * tileSize}px`;
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;

      course.appendChild(tile);
    });
  });
}