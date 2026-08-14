export const DASH_WIDTH = 960;
export const DASH_HEIGHT = 420;
export const DASH_GROUND = 330;

export interface DashObstacle {
  x: number;
  width: number;
  height: number;
  type: 'spike' | 'block';
}

interface DashPlayer {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

function drawSpike(context: CanvasRenderingContext2D, obstacle: DashObstacle) {
  const count = obstacle.width > 50 ? 2 : 1;
  const spikeWidth = obstacle.width / count;
  for (let index = 0; index < count; index++) {
    const x = obstacle.x + spikeWidth * index;
    context.beginPath();
    context.moveTo(x, DASH_GROUND);
    context.lineTo(x + spikeWidth / 2, DASH_GROUND - obstacle.height);
    context.lineTo(x + spikeWidth, DASH_GROUND);
    context.closePath(); context.fill(); context.stroke();
  }
}

export function renderDashScene(context: CanvasRenderingContext2D, obstacles: DashObstacle[], player: DashPlayer, score: number) {
  const hue = (245 + Math.floor(score / 80) * 28) % 360;
  const gradient = context.createLinearGradient(0, 0, 0, DASH_HEIGHT);
  gradient.addColorStop(0, `hsl(${hue} 58% 24%)`); gradient.addColorStop(1, `hsl(${(hue + 45) % 360} 50% 45%)`);
  context.fillStyle = gradient; context.fillRect(0, 0, DASH_WIDTH, DASH_HEIGHT);
  context.globalAlpha = .15; context.strokeStyle = '#fff'; context.lineWidth = 1;
  const offset = (score * 9) % 48;
  for (let x = -offset; x < DASH_WIDTH; x += 48) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, DASH_GROUND); context.stroke(); }
  for (let y = 42; y < DASH_GROUND; y += 48) { context.beginPath(); context.moveTo(0, y); context.lineTo(DASH_WIDTH, y); context.stroke(); }
  context.globalAlpha = 1; context.fillStyle = '#152143'; context.fillRect(0, DASH_GROUND, DASH_WIDTH, DASH_HEIGHT - DASH_GROUND);
  context.fillStyle = '#60f0d0'; context.fillRect(0, DASH_GROUND, DASH_WIDTH, 7);

  obstacles.forEach(obstacle => {
    context.fillStyle = obstacle.type === 'block' ? '#ffbd3e' : '#ff5470';
    context.strokeStyle = '#fff'; context.lineWidth = 3;
    if (obstacle.type === 'spike') drawSpike(context, obstacle);
    else {
      context.fillRect(obstacle.x, DASH_GROUND - obstacle.height, obstacle.width, obstacle.height);
      context.strokeRect(obstacle.x, DASH_GROUND - obstacle.height, obstacle.width, obstacle.height);
      context.fillStyle = '#d77a25';
      context.fillRect(obstacle.x + 10, DASH_GROUND - obstacle.height + 10, obstacle.width - 20, obstacle.height - 20);
    }
  });

  context.save(); context.translate(player.x + player.size / 2, player.y + player.size / 2); context.rotate(player.rotation);
  context.fillStyle = '#60f0d0'; context.strokeStyle = '#fff'; context.lineWidth = 4;
  context.fillRect(-player.size / 2, -player.size / 2, player.size, player.size); context.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);
  context.fillStyle = '#18295f'; context.fillRect(-10, -8, 6, 8); context.fillRect(5, -8, 6, 8); context.fillRect(-9, 8, 20, 5); context.restore();
}
