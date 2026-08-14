import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashGame } from '../components/DashGame';
import '../game/dashGame.css';

export function GamePage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Dash Trip — мини-игра';
    return () => { document.title = previousTitle; };
  }, []);

  return <main className="dash-page">
    <header className="dash-header">
      <Link to="/" aria-label="Вернуться на главную">← На главную</Link>
      <div><span>SECRET LEVEL</span><h1>DASH TRIP</h1></div>
      <span className="dash-key-hint">Ф + Э</span>
    </header>
    <DashGame/>
  </main>;
}
