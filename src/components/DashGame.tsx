import { useEffect, useRef, useState } from 'react';
import { createDashEngine, type GameSnapshot } from '../game/dashEngine';

const initialState: GameSnapshot = { score: 0, best: 0, status: 'ready' };

export function DashGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jumpRef = useRef<() => void>(() => undefined);
  const restartRef = useRef<() => void>(() => undefined);
  const [game, setGame] = useState(initialState);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createDashEngine(canvasRef.current, setGame);
    jumpRef.current = engine.jump;
    restartRef.current = engine.reset;
    const handleKey = (event: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
        event.preventDefault();
        if (!event.repeat) engine.jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); engine.destroy(); };
  }, []);

  return <section className="dash-shell" aria-label="Игра Прыжок-квадрат">
    <div className="dash-hud">
      <span>СЧЁТ <strong>{game.score}</strong></span>
      <span>РЕКОРД <strong>{game.best}</strong></span>
    </div>
    <div className="dash-stage" onPointerDown={() => jumpRef.current()}>
      <canvas ref={canvasRef}/>
      {game.status !== 'playing' && <div className="dash-overlay">
        <h2>{game.status === 'lost' ? 'СТОЛКНОВЕНИЕ!' : 'ГОТОВ?'}</h2>
        <p>{game.status === 'lost' ? `Счёт: ${game.score}` : 'Перепрыгивай препятствия и держи ритм'}</p>
        <button type="button" onPointerDown={event => { event.stopPropagation(); jumpRef.current(); }}>
          {game.status === 'lost' ? 'ЕЩЁ РАЗ' : 'ИГРАТЬ'}
        </button>
      </div>}
    </div>
    <p className="dash-controls"><kbd>ПРОБЕЛ</kbd> / <kbd>↑</kbd> / нажатие по экрану — прыжок</p>
    <button className="dash-restart" type="button" onClick={() => restartRef.current()}>Начать заново</button>
  </section>;
}
