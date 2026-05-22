const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

// Sounds
const chompSound = document.getElementById("chompSound");
const deathSound = document.getElementById("deathSound");

// Difficulty
let ghostSpeed = 600;

// Lives system ❤️
let lives = 3;

// Power mode 💊
let powerMode = false;
let powerTimer = null;

// Maze (2 = power pellet)
const grid = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,1,0,0,0,2,1],
  [1,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1],
  [1,0,2,0,0,0,2,1,0,1],
  [1,0,1,1,1,1,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

const tileSize = 50;

// Player
let pacman = { x: 1, y: 1 };

// Ghosts
let ghosts = [
  { x: 8, y: 1, color: "red" },
  { x: 8, y: 8, color: "pink" }
];

// Difficulty selector
document.getElementById("difficulty").addEventListener("change", (e) => {
  const v = e.target.value;

  if (v === "easy") ghostSpeed = 900;
  if (v === "medium") ghostSpeed = 600;
  if (v === "hard") ghostSpeed = 300;
});

// Controls
document.addEventListener("keydown", (e) => {
  let nx = pacman.x;
  let ny = pacman.y;

  if (e.key === "ArrowUp") ny--;
  if (e.key === "ArrowDown") ny++;
  if (e.key === "ArrowLeft") nx--;
  if (e.key === "ArrowRight") nx++;

  const tile = grid[ny][nx];

  if (tile !== 1) {
    pacman.x = nx;
    pacman.y = ny;

    chompSound.currentTime = 0;
    chompSound.play();

    // 💊 POWER PELLET
    if (tile === 2) {
      activatePowerMode();
      grid[ny][nx] = 0;
    }
  }
});

// 💊 Power mode activation
function activatePowerMode() {
  powerMode = true;

  clearTimeout(powerTimer);
  powerTimer = setTimeout(() => {
    powerMode = false;
  }, 7000); // 7 seconds
}

// 👻 Ghost movement
function moveGhosts() {
  ghosts.forEach(g => {
    let dirs = [
      {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}
    ];

    let move = dirs[Math.floor(Math.random() * dirs.length)];
    let nx = g.x + move.x;
    let ny = g.y + move.y;

    if (grid[ny][nx] !== 1) {
      g.x = nx;
      g.y = ny;
    }
  });
}

// Draw maze + pellets
function drawMaze() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {

      if (grid[y][x] === 1) {
        ctx.fillStyle = "#1e90ff";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // normal pellet
        if (grid[y][x] === 0) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x*tileSize+25, y*tileSize+25, 4, 0, Math.PI*2);
          ctx.fill();
        }

        // 💊 power pellet
        if (grid[y][x] === 2) {
          ctx.fillStyle = "yellow";
          ctx.beginPath();
          ctx.arc(x*tileSize+25, y*tileSize+25, 8, 0, Math.PI*2);
          ctx.fill();
        }
      }
    }
  }
}

// Draw Pac-Man
function drawPacman() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    pacman.x * tileSize + 25,
    pacman.y * tileSize + 25,
    15,
    0.2 * Math.PI,
    1.8 * Math.PI
  );
  ctx.lineTo(
    pacman.x * tileSize + 25,
    pacman.y * tileSize + 25
  );
  ctx.fill();
}

// 👻 Ghosts (blue when vulnerable)
function drawGhosts() {
  ghosts.forEach(g => {
    ctx.fillStyle = powerMode ? "cyan" : g.color;

    ctx.beginPath();
    ctx.arc(
      g.x * tileSize + 25,
      g.y * tileSize + 25,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

// ❤️ Lives UI
function drawLives() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Lives: " + lives, 10, 20);
}

// 💥 Collision logic
function checkCollisions() {
  ghosts.forEach((g, index) => {

    if (g.x === pacman.x && g.y === pacman.y) {

      if (powerMode) {
        // eat ghost
        ghosts[index] = { x: 8, y: 8, color: g.color };
      } else {
        // lose life
        lives--;
        deathSound.play();

        pacman.x = 1;
        pacman.y = 1;

        if (lives <= 0) {
          alert("💀 Game Over!");
          location.reload();
        }
      }
    }
  });
}

// Game loop
function update() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawMaze();
  drawPacman();
  drawGhosts();
  drawLives();

  checkCollisions();

  requestAnimationFrame(update);
}
update();

// Ghost speed loop (difficulty)
setInterval(moveGhosts, ghostSpeed);
