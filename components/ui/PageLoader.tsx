
export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Бет жүктелуде"
      className="w-full min-h-[65vh] bg-white px-4 pb-12 pt-28 sm:px-6 md:pt-32"
    >
      <div className="mx-auto w-full max-w-4xl animate-pulse space-y-5">

        {/* ================= HEADER ================= */}
        <div className="space-y-3">
          <div className="h-[18px] w-[55%] max-w-[310px] rounded-[5px] bg-slate-200" />

          <div className="h-[12px] w-[75%] max-w-[420px] rounded-[4px] bg-slate-100" />
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[7px] bg-slate-50 p-2"
            >
              <div className="mb-2 h-[8px] w-[70%] rounded bg-slate-200" />
              <div className="h-[14px] w-[55%] rounded bg-slate-300" />
            </div>
          ))}
        </div>

        {/* ================= PROGRESS ================= */}
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between gap-3">
            <div className="h-[9px] w-[30%] rounded bg-slate-200" />
            <div className="h-[9px] w-[15%] rounded bg-indigo-200" />
          </div>

          <div className="h-[11px] w-[85%] rounded bg-slate-300" />
          <div className="h-[11px] w-[65%] rounded bg-slate-200" />
        </div>

        {/* ================= ANSWERS ================= */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[44px] items-center gap-3 rounded-[7px] bg-slate-50 px-2"
            >
              <div className="h-[22px] w-[22px] shrink-0 rounded-full bg-indigo-100" />

              <div
                className={`h-[9px] rounded bg-slate-200 ${
                  i % 2 === 0 ? "w-[75%]" : "w-[55%]"
                }`}
              />
            </div>
          ))}
        </div>

        <span className="sr-only">Жүктелуде...</span>
      </div>
    </div>
  );
}
