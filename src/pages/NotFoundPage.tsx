import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-mist px-5 text-center"><div><p className="text-8xl font-black text-brand">404</p><h1 className="mt-4 text-3xl font-black text-navy">Такой страницы пока нет</h1><p className="mt-3 text-slate-500">Но подходящий тур точно найдётся.</p><Link to="/" className="mt-7 inline-flex rounded-full bg-navy px-6 py-3 font-extrabold text-white transition hover:bg-brand-dark">Вернуться на главную</Link></div></main>;
}
