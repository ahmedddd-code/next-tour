export function TourCardSkeleton() {
  return <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"><div className="h-60 bg-slate-200"/><div className="space-y-4 p-5"><div className="h-3 w-1/3 rounded bg-slate-200"/><div className="h-6 w-4/5 rounded bg-slate-200"/><div className="grid grid-cols-2 gap-3"><div className="h-4 rounded bg-slate-100"/><div className="h-4 rounded bg-slate-100"/></div><div className="h-12 rounded-2xl bg-slate-200"/></div></div>;
}
