import { renderDashScene, type DashObstacle, DASH_GROUND, DASH_HEIGHT, DASH_WIDTH } from './dashRenderer';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'lost';

export interface GameSnapshot {
  score: number;
  best: number;
  status: GameStatus;
}

const PLAYER_X = 145;
const PLAYER_SIZE = 38;
const JUMP_SPEED = -720;
const GRAVITY = 2500;
const JUMP_BUFFER = .14;
const QUARTER_TURN = Math.PI / 2;

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
  let playerY = DASH_GROUND - PLAYER_SIZE;
  let velocity = 0;
  let grounded = true;
  let rotation = 0;
  let bufferedJump = 0;
  let spawnDistance = 440;
  let obstacles: DashObstacle[] = [];

  function emitState() {
    const roundedScore = Math.floor(score);
    if (roundedScore === emittedScore && best === emittedBest && status === emittedStatus) return;
    emittedScore = roundedScore; emittedBest = best; emittedStatus = status;
    onChange({ score: roundedScore, best, status });
  }

  function reset() {
    status = 'ready'; score = 0; velocity = 0; rotation = 0;
    playerY = DASH_GROUND - PLAYER_SIZE; grounded = true; bufferedJump = 0; spawnDistance = 440; obstacles = [];
    emitState();
  }

  function jump() {
    if (status === 'paused') return;
    if (status === 'lost') reset();
    if (status === 'ready') status = 'playing';
    if (grounded) { velocity = JUMP_SPEED; grounded = false; }
    else bufferedJump = JUMP_BUFFER;
    emitState();
  }

  function togglePause() {
    if (status === 'playing') status = 'paused';
    else if (status === 'paused') status = 'playing';
    else return;
    emitState();
  }

  function addObstacle() {
    const block = Math.random() > .68;
    const doubleSpike = !block && Math.random() > .55;
    obstacles.push({
      x: DASH_WIDTH + 30,
      width: block ? 54 + Math.random() * 24 : doubleSpike ? 76 : 40,
      height: block ? 50 + Math.random() * 24 : 42,
      type: block ? 'block' : 'spike',
    });
    spawnDistance = 280 + Math.random() * 280;
  }

  function update(delta: number) {
    if (status !== 'playing') return;
    const speed = 340 + Math.min(score * .55, 150);
    const wasGrounded = grounded;
    const previousBottom = playerY + PLAYER_SIZE;
    bufferedJump = Math.max(0, bufferedJump - delta);
    spawnDistance -= speed * delta;
    if (spawnDistance <= 0) addObstacle();
    obstacles.forEach(obstacle => { obstacle.x -= speed * delta; });
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > -10);

    velocity += GRAVITY * delta;
    let nextY = Math.min(DASH_GROUND - PLAYER_SIZE, playerY + velocity * delta);
    grounded = nextY >= DASH_GROUND - PLAYER_SIZE;
    let hit = false;
    const playerLeft = PLAYER_X + 5;
    const playerRight = PLAYER_X + PLAYER_SIZE - 5;
    obstacles.forEach(obstacle => {
      if (playerRight <= obstacle.x + 4 || playerLeft >= obstacle.x + obstacle.width - 4) return;
      const obstacleTop = DASH_GROUND - obstacle.height;
      const landsOnTop = obstacle.type === 'block' && velocity >= 0
        && previousBottom <= obstacleTop + 7 && nextY + PLAYER_SIZE >= obstacleTop;
      if (landsOnTop) {
        nextY = obstacleTop - PLAYER_SIZE;
        velocity = 0;
        grounded = true;
      } else if (nextY + PLAYER_SIZE - 7 > obstacleTop) hit = true;
    });
    playerY = nextY;
    if (grounded) {
      velocity = 0;
      rotation = Math.round(rotation / QUARTER_TURN) * QUARTER_TURN;
      if (!wasGrounded && bufferedJump > 0) {
        velocity = JUMP_SPEED;
        grounded = false;
        bufferedJump = 0;
      }
    } else rotation = (rotation + delta * 5.5) % (Math.PI * 2);
    score += delta * 10;
    if (hit) {
      status = 'lost';
      best = Math.max(best, Math.floor(score));
      saveBestScore(best);
    }
    emitState();
  }

  function loop(time: number) {
    const delta = Math.min((time - previousTime) / 1000 || 0, .032); previousTime = time;
    update(delta);
    renderDashScene(context, obstacles, { x: PLAYER_X, y: playerY, size: PLAYER_SIZE, rotation }, score);
    frame = requestAnimationFrame(loop);
  }
  canvas.width = DASH_WIDTH; canvas.height = DASH_HEIGHT; reset(); frame = requestAnimationFrame(loop);
  return { jump, reset, togglePause, destroy: () => cancelAnimationFrame(frame) };
}
