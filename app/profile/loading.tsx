
export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 md:px-8">
      <div className="mx-auto max-w-4xl space-y-5 animate-pulse">

        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200" />

          <div className="flex-1 space-y-3">
            <div className="h-5 w-40 max-w-full rounded-lg bg-slate-200" />
            <div className="h-4 w-56 max-w-full rounded-lg bg-slate-100" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 bg-white p-5">
              <div className="h-4 w-24 max-w-full rounded bg-slate-100" />
              <div className="h-8 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 h-5 w-44 rounded bg-slate-200" />
          <div className="h-48 rounded-xl bg-slate-100" />
        </div>

        {/* History */}
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-slate-200" />

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 max-w-full rounded bg-slate-200" />
                <div className="h-2 w-full rounded bg-slate-100" />
              </div>
              <div className="h-10 w-20 rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
