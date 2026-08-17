import { Header } from './Header';

export function PageHeader({ title, eyebrow }: { title: string; eyebrow: string }) {
  return <div className="relative min-h-56 bg-navy text-white sm:min-h-64">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(0,200,83,.28),transparent_38%)]"/>
    <Header/>
    <div className="section-shell relative flex min-h-56 flex-col justify-end pb-8 pt-24 sm:min-h-64 sm:pb-10">
      <p className="text-xs font-black uppercase tracking-[.18em] text-brand">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-5xl">{title}</h1>
    </div>
  </div>;
}
