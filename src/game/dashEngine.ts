export type GameStatus = 'ready' | 'playing' | 'lost';

export interface GameSnapshot {
  score: number;
  best: number;
  status: GameStatus;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'spike' | 'block';
}

const WIDTH = 960;
const HEIGHT = 420;
const GROUND = 330;
const PLAYER_X = 145;
const PLAYER_SIZE = 38;

function readBestScore() {
  try {
    const storedScore = Number(localStorage.getItem('dash-best'));
    return Number.isFinite(storedScore) && storedScore > 0 ? Math.floor(storedScore) : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem('dash-best', String(score));
  } catch {
    // The game still works when browser storage is disabled.
  }
}

export function createDashEngine(canvas: HTMLCanvasElement, onChange: (state: GameSnapshot) => void) {
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) throw new Error('Canvas is not supported');
  const context: CanvasRenderingContext2D = canvasContext;
  let frame = 0;
  let previousTime = 0;
  let status: GameStatus = 'ready';
  let score = 0;
  let best = readBestScore();
  let emittedScore = -1;
  let emittedBest = -1;
  let emittedStatus: GameStatus | null = null;
  let playerY = GROUND - PLAYER_SIZE;
  let velocity = 0;
  let rotation = 0;
  let spawnDistance = 440;
  let obstacles: Obstacle[] = [];

  function emitState() {
    const roundedScore = Math.floor(score);
    if (roundedScore === emittedScore && best === emittedBest && status === emittedStatus) return;
    emittedScore = roundedScore; emittedBest = best; emittedStatus = status;
    onChange({ score: roundedScore, best, status });
  }

  function reset() {
    status = 'ready'; score = 0; velocity = 0; rotation = 0;
    playerY = GROUND - PLAYER_SIZE; spawnDistance = 440; obstacles = [];
    emitState();
  }

  function jump() {
    if (status === 'lost') reset();
    if (status === 'ready') status = 'playing';
    if (playerY >= GROUND - PLAYER_SIZE - 1) velocity = -720;
    emitState();
  }

  function addObstacle() {
    const block = Math.random() > .7;
    obstacles.push({ x: WIDTH + 30, width: block ? 48 : 40, height: block ? 58 : 42, type: block ? 'block' : 'spike' });
    spawnDistance = 250 + Math.random() * 250;
  }

  function update(delta: number) {
    if (status !== 'playing') return;
    const speed = 340 + Math.min(score * .55, 150);
    velocity += 1900 * delta;
    playerY = Math.min(GROUND - PLAYER_SIZE, playerY + velocity * delta);
    if (playerY >= GROUND - PLAYER_SIZE) velocity = 0;
    else rotation += delta * 5.5;
    spawnDistance -= speed * delta;
    if (spawnDistance <= 0) addObstacle();
    obstacles.forEach(obstacle => { obstacle.x -= speed * delta; });
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > -10);
    score += delta * 10;

    const inset = 7;
    const hit = obstacles.some(obstacle => PLAYER_X + PLAYER_SIZE - inset > obstacle.x + 5
      && PLAYER_X + inset < obstacle.x + obstacle.width - 5
      && playerY + PLAYER_SIZE - inset > GROUND - obstacle.height);
    if (hit) {
      status = 'lost';
      best = Math.max(best, Math.floor(score));
      saveBestScore(best);
    }
    emitState();
  }

  function draw() {
    const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#18295f'); gradient.addColorStop(1, '#6e39a8');
    context.fillStyle = gradient; context.fillRect(0, 0, WIDTH, HEIGHT);
    context.globalAlpha = .15; context.strokeStyle = '#fff'; context.lineWidth = 1;
    const offset = (score * 9) % 48;
    for (let x = -offset; x < WIDTH; x += 48) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, GROUND); context.stroke(); }
    for (let y = 42; y < GROUND; y += 48) { context.beginPath(); context.moveTo(0, y); context.lineTo(WIDTH, y); context.stroke(); }
    context.globalAlpha = 1; context.fillStyle = '#152143'; context.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);
    context.fillStyle = '#60f0d0'; context.fillRect(0, GROUND, WIDTH, 7);

    obstacles.forEach(obstacle => {
      context.fillStyle = obstacle.type === 'block' ? '#ffbd3e' : '#ff5470';
      context.strokeStyle = '#fff'; context.lineWidth = 3; context.beginPath();
      if (obstacle.type === 'spike') {
        context.moveTo(obstacle.x, GROUND); context.lineTo(obstacle.x + obstacle.width / 2, GROUND - obstacle.height); context.lineTo(obstacle.x + obstacle.width, GROUND);
      } else context.rect(obstacle.x, GROUND - obstacle.height, obstacle.width, obstacle.height);
      context.closePath(); context.fill(); context.stroke();
    });

    context.save(); context.translate(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2); context.rotate(rotation);
    context.fillStyle = '#60f0d0'; context.strokeStyle = '#fff'; context.lineWidth = 4;
    context.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE); context.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    context.fillStyle = '#18295f'; context.fillRect(-10, -8, 6, 8); context.fillRect(5, -8, 6, 8); context.fillRect(-9, 8, 20, 5); context.restore();
  }

  function loop(time: number) {
    const delta = Math.min((time - previousTime) / 1000 || 0, .032); previousTime = time;
    update(delta); draw(); frame = requestAnimationFrame(loop);
  }
  canvas.width = WIDTH; canvas.height = HEIGHT; reset(); frame = requestAnimationFrame(loop);
  return { jump, reset, destroy: () => cancelAnimationFrame(frame) };
}
