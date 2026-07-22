const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

const keys = {};
const touchState = { left: false, right: false };
const GAME_WIDTH = 480;
const GAME_HEIGHT = 600;
let score = 0;
let gameOver = false;
let lastTime = 0;
let bulletCooldown = 0;
let enemySpawnTimer = 0;

const player = {
  x: GAME_WIDTH / 2 - 20,
  y: GAME_HEIGHT - 60,
  width: 40,
  height: 40,
  speed: 320
};

const bullets = [];
const enemies = [];
const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * GAME_WIDTH,
  y: Math.random() * GAME_HEIGHT,
  radius: Math.random() * 1.8 + 0.6,
  speed: Math.random() * 50 + 20
}));

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = GAME_WIDTH * scale;
  canvas.height = GAME_HEIGHT * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function resetGame() {
  score = 0;
  gameOver = false;
  bullets.length = 0;
  enemies.length = 0;
  player.x = GAME_WIDTH / 2 - 20;
  player.y = GAME_HEIGHT - 60;
  scoreEl.textContent = score;
}

function shoot() {
  if (gameOver || bulletCooldown > 0) return;

  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 12,
    speed: 460
  });

  bulletCooldown = 0.2;
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (GAME_WIDTH - 34),
    y: -30,
    width: 34,
    height: 34,
    speed: 120 + Math.random() * 80
  });
}

function isColliding(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function handleInput(dt) {
  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchState.left) {
    player.x -= player.speed * dt;
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchState.right) {
    player.x += player.speed * dt;
  }

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
}

function update(dt) {
  if (gameOver) return;

  handleInput(dt);
  bulletCooldown = Math.max(0, bulletCooldown - dt);

  for (const star of stars) {
    star.y += star.speed * dt;
    if (star.y > GAME_HEIGHT + 2) {
      star.y = -2;
      star.x = Math.random() * GAME_WIDTH;
    }
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed * dt;

    if (bullet.y + bullet.height < 0) {
      bullets.splice(i, 1);
    }
  }

  enemySpawnTimer -= dt;
  if (enemySpawnTimer <= 0) {
    spawnEnemy();
    enemySpawnTimer = 0.8;
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    enemy.y += enemy.speed * dt;

    if (enemy.y > GAME_HEIGHT + 20) {
      enemies.splice(i, 1);
      continue;
    }

    if (isColliding(enemy, player)) {
      gameOver = true;
      break;
    }

    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      const bullet = bullets[j];
      if (isColliding(enemy, bullet)) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 1;
        scoreEl.textContent = score;
        break;
      }
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, '#0b1024');
  gradient.addColorStop(1, '#03050c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f7ff';
    ctx.fill();
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = '#4e6cff';
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(40, 40);
  ctx.lineTo(30, 36);
  ctx.lineTo(20, 40);
  ctx.lineTo(10, 36);
  ctx.lineTo(0, 40);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(14, 12, 12, 10);
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = '#ffd166';
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawEnemies() {
  ctx.fillStyle = '#ff6b6b';
  for (const enemy of enemies) {
    ctx.beginPath();
    ctx.moveTo(enemy.x + 17, enemy.y);
    ctx.lineTo(enemy.x + 34, enemy.y + 18);
    ctx.lineTo(enemy.x + 24, enemy.y + 34);
    ctx.lineTo(enemy.x + 17, enemy.y + 24);
    ctx.lineTo(enemy.x + 10, enemy.y + 34);
    ctx.lineTo(enemy.x, enemy.y + 18);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGameOver() {
  if (!gameOver) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
  ctx.font = '20px Arial';
  ctx.fillText('Tap canvas to restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
}

function render() {
  drawBackground();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawGameOver();
}

function frame(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.03);
  lastTime = timestamp;

  update(dt);
  render();
  requestAnimationFrame(frame);
}

function setButtonState(button, active) {
  button.classList.toggle('pressed', active);
}

function connectButton(button, stateKey, onDown) {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    touchState[stateKey] = true;
    setButtonState(button, true);
    if (typeof onDown === 'function') {
      onDown();
    }
  });

  const release = () => {
    touchState[stateKey] = false;
    setButtonState(button, false);
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;

  if ((event.code === 'Space' || event.key === ' ') && !gameOver) {
    event.preventDefault();
    shoot();
  }

  if (event.key === 'Enter' && gameOver) {
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

canvas.addEventListener('pointerdown', () => {
  if (gameOver) {
    resetGame();
  }
});

connectButton(leftBtn, 'left');
connectButton(rightBtn, 'right');
connectButton(shootBtn, null, shoot);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
resetGame();
requestAnimationFrame(frame);
