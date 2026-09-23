export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-8 w-52 rounded-lg bg-slate-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map((i)=><div key={i} className="h-28 rounded-2xl bg-white ring-1 ring-slate-200" />)}
        </div>
        <div className="mt-6 h-80 rounded-2xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
