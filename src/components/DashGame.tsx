import { useEffect, useRef, useState } from 'react';
import { createDashEngine, type GameSnapshot } from '../game/dashEngine';

const initialState: GameSnapshot = { score: 0, best: 0, status: 'ready' };

export function DashGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jumpRef = useRef<() => void>(() => undefined);
  const restartRef = useRef<() => void>(() => undefined);
  const pauseRef = useRef<() => void>(() => undefined);
  const [game, setGame] = useState(initialState);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = createDashEngine(canvasRef.current, setGame);
    jumpRef.current = engine.jump;
    restartRef.current = engine.reset;
    pauseRef.current = engine.togglePause;
    const handleKey = (event: KeyboardEvent) => {
      if (['KeyP', 'Escape'].includes(event.code)) {
        event.preventDefault();
        if (!event.repeat) engine.togglePause();
        return;
      }
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
      <button type="button" disabled={!['playing', 'paused'].includes(game.status)} onClick={() => pauseRef.current()}>
        {game.status === 'paused' ? '▶ ПРОДОЛЖИТЬ' : 'Ⅱ ПАУЗА'}
      </button>
      <span>РЕКОРД <strong>{game.best}</strong></span>
    </div>
    <div className="dash-stage" onPointerDown={() => jumpRef.current()}>
      <canvas ref={canvasRef}/>
      {game.status !== 'playing' && <div className="dash-overlay">
        <h2>{game.status === 'lost' ? 'СТОЛКНОВЕНИЕ!' : game.status === 'paused' ? 'ПАУЗА' : 'ГОТОВ?'}</h2>
        <p>{game.status === 'lost' ? `Счёт: ${game.score}` : game.status === 'paused' ? 'Игра остановлена' : 'Перепрыгивай препятствия и держи ритм'}</p>
        <button type="button" onPointerDown={event => {
          event.stopPropagation();
          if (game.status === 'paused') pauseRef.current(); else jumpRef.current();
        }}>
          {game.status === 'lost' ? 'ЕЩЁ РАЗ' : game.status === 'paused' ? 'ПРОДОЛЖИТЬ' : 'ИГРАТЬ'}
        </button>
      </div>}
    </div>
    <p className="dash-controls"><kbd>ПРОБЕЛ</kbd> / <kbd>↑</kbd> / нажатие — прыжок · <kbd>P</kbd> / <kbd>Esc</kbd> — пауза</p>
    <button className="dash-restart" type="button" onClick={() => restartRef.current()}>Начать заново</button>
  </section>;
}
