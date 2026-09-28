// app/profile/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserAttemptsHistory } from '@/db/queries';
import Link from 'next/link';

/* =========================================================
   HELPERS
========================================================= */

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('kk-KZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('kk-KZ', {
    day: '2-digit',
    month: '2-digit',
  });
}

type Tone = { text: string; bg: string; bar: string; hex: string };

function tone(score: number, total: number): Tone {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.7)
    return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500', hex: '#10b981' };
  if (ratio >= 0.4)
    return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', bar: 'bg-amber-500', hex: '#f59e0b' };
  return { text: 'text-red-700', bg: 'bg-red-50 border-red-200', bar: 'bg-red-500', hex: '#ef4444' };
}

/* =========================================================
   PROGRESS CHART (чистый SVG) — ось Y в процентах,
   чтобы тесты с разным числом вопросов были сравнимы
========================================================= */

function ProgressChart({
  data,
}: {
  data: { score: number; total: number; date: string }[];
}) {
  if (data.length === 0) return null;

  const chronological = [...data].reverse();

  const width = 600;
  const height = 190;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const points = chronological.map((d, i) => {
    const ratio = d.total > 0 ? d.score / d.total : 0;
    const x =
      chronological.length === 1
        ? padLeft + innerW / 2
        : padLeft + (i / (chronological.length - 1)) * innerW;
    const y = padTop + innerH * (1 - ratio);
    return { x, y, ratio, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const baseY = padTop + innerH;
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${baseY} L ${points[0].x.toFixed(1)} ${baseY} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[420px]"
        role="img"
        aria-label="Тест нәтижелерінің динамикасы, пайызбен"
      >
        <defs>
          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((r) => {
          const y = padTop + innerH * (1 - r);
          return (
            <g key={r}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray={r === 0 ? undefined : '3 4'}
              />
              <text x={padLeft - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                {Math.round(r * 100)}%
              </text>
            </g>
          );
        })}

        {points.length > 1 && <path d={areaD} fill="url(#progressFill)" className="chart-area" />}

        {points.length > 1 && (
          <path
            d={pathD}
            pathLength={1}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />
        )}

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="#ffffff" stroke={tone(p.score, p.total).hex} strokeWidth={3}>
              <title>{`${formatDateShort(p.date)} — ${p.score}/${p.total} (${Math.round(p.ratio * 100)}%)`}</title>
            </circle>
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {formatDateShort(p.date)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/login');
  }

  const history = await getUserAttemptsHistory(session.user.id);

  const attemptsCount = history.length;
  const bestScore = attemptsCount > 0 ? Math.max(...history.map((h) => h.score)) : null;
  const bestTotal =
    attemptsCount > 0 ? history.find((h) => h.score === bestScore)?.total ?? 40 : null;
  const avgScore =
    attemptsCount > 0
      ? Math.round((history.reduce((sum, h) => sum + h.score, 0) / attemptsCount) * 10) / 10
      : null;

  const chronological = [...history].reverse();
  const firstScore = chronological[0]?.score ?? null;
  const lastScore = chronological[chronological.length - 1]?.score ?? null;
  const progressDelta =
    firstScore !== null && lastScore !== null && chronological.length > 1
      ? lastScore - firstScore
      : null;

  const chartData = history.slice(0, 10).map((h) => ({
    score: h.score,
    total: h.total,
    date: h.finishedAt ?? h.startedAt,
  }));

  const recentHistory = history.slice(0, 5);
  const latest = history[0];
  const latestPercent = latest && latest.total > 0 ? Math.round((latest.score / latest.total) * 100) : null;

  const stats: { label: string; value: string; valueClass?: string }[] = [
    { label: 'Тапсырылған тест', value: String(attemptsCount) },
    { label: 'Ең жоғары нәтиже', value: bestScore !== null ? `${bestScore} / ${bestTotal}` : '—' },
    { label: 'Орташа балл', value: avgScore !== null ? String(avgScore) : '—' },
    {
      label: 'Өзгеріс',
      value: progressDelta === null ? '—' : progressDelta > 0 ? `+${progressDelta}` : String(progressDelta),
      valueClass:
        progressDelta === null
          ? 'text-slate-400'
          : progressDelta > 0
          ? 'text-emerald-600'
          : progressDelta < 0
          ? 'text-red-600'
          : 'text-slate-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 font-sans text-slate-800 md:px-8">
      <style>{`
        .chart-line{stroke-dasharray:1;stroke-dashoffset:1;animation:drawLine 1.1s ease-out .15s forwards}
        .chart-area{opacity:0;animation:fadeArea .6s ease-out .9s forwards}
        @keyframes drawLine{to{stroke-dashoffset:0}}
        @keyframes fadeArea{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){
          .chart-line{animation:none;stroke-dashoffset:0}
          .chart-area{animation:none;opacity:1}
        }
      `}</style>

      <div className="mx-auto max-w-4xl space-y-5">
        {/* ============================= HEADER ============================= */}
        <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
              {session.user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {session.user.name}
              </h1>
              <p className="truncate text-sm text-slate-500">{session.user.email}</p>
            </div>
          </div>

          {/* <Link
            href="/testent"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
          >
            Жаңа тест тапсыру
          </Link> */}
        </header>

        {/* ============================= STATS ============================= */}
        <section
          aria-label="Статистика"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`mt-1.5 text-2xl font-bold tabular-nums text-slate-900 ${s.valueClass ?? ''}`}>
                {s.value}
              </p>
            </div>
          ))}
        </section>

        {/* ============================= PROGRESS CHART ============================= */}
        {chartData.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">Нәтиже динамикасы</h2>
                <p className="mt-0.5 text-sm text-slate-500">Соңғы {chartData.length} тест, пайызбен</p>
              </div>
              {latestPercent !== null && (
                <div className="text-right">
                  <p className="text-3xl font-bold tabular-nums text-slate-900">{latestPercent}%</p>
                  <p className="text-xs text-slate-500">соңғы тест</p>
                </div>
              )}
            </div>
            <ProgressChart data={chartData} />
          </section>
        )}

        {/* ============================= HISTORY ============================= */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-slate-900">Тест тарихы</h2>
            {history.length > 5 && (
              <span className="text-sm text-slate-500">Соңғы 5 тест · барлығы {history.length}</span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-sm text-slate-500">Сіз әлі тест тапсырмадыңыз.</p>
              <Link
                href="/testent"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Тестті бастау
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentHistory.map((attempt) => {
                const t = tone(attempt.score, attempt.total);
                const percent = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
                return (
                  <li key={attempt.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {attempt.finishedAt ? formatDate(attempt.finishedAt) : formatDate(attempt.startedAt)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500">
                          {percent}%
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400">ID: {attempt.id.slice(0, 8)}</p>
                    </div>

                    <span
                      className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-bold tabular-nums ${t.bg} ${t.text}`}
                    >
                      {attempt.score} / {attempt.total}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}