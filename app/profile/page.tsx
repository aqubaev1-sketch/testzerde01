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

function scoreColor(score: number, total: number) {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.7) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (ratio >= 0.4) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

/* =========================================================
   PROGRESS CHART (чистый SVG, без внешних библиотек)
========================================================= */

function ProgressChart({
  data,
}: {
  data: { score: number; total: number; date: string }[];
}) {
  if (data.length === 0) return null;

  // график читается слева направо по хронологии — история приходит от новых к старым,
  // разворачиваем для отображения
  const chronological = [...data].reverse();

  const width = 600;
  const height = 160;
  const paddingX = 24;
  const paddingY = 20;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const maxTotal = Math.max(...chronological.map((d) => d.total), 1);

  const points = chronological.map((d, i) => {
    const x =
      chronological.length === 1
        ? paddingX + innerWidth / 2
        : paddingX + (i / (chronological.length - 1)) * innerWidth;
    const ratio = d.score / maxTotal;
    const y = paddingY + innerHeight - ratio * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(
    paddingY + innerHeight
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingY + innerHeight).toFixed(1)} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[400px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* горизонтальные направляющие линии */}
        {[0, 0.5, 1].map((r) => (
          <line
            key={r}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY + innerHeight * (1 - r)}
            y2={paddingY + innerHeight * (1 - r)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {/* заливка под линией */}
        <path d={areaD} fill="url(#progressFill)" />

        {/* сама линия */}
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* точки + подписи */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#ffffff" stroke="#6366f1" strokeWidth={2.5} />
            <text
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#94a3b8"
            >
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

  // прогресс: сравнение последней попытки с первой (по хронологии)
  const chronological = [...history].reverse();
  const firstScore = chronological[0]?.score ?? null;
  const lastScore = chronological[chronological.length - 1]?.score ?? null;
  const progressDelta =
    firstScore !== null && lastScore !== null && chronological.length > 1
      ? lastScore - firstScore
      : null;

  // берём последние 10 попыток для графика, чтобы не перегружать
  const chartData = history.slice(0, 10).map((h) => ({
    score: h.score,
    total: h.total,
    date: h.finishedAt ?? h.startedAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10 font-sans text-slate-800 md:px-8 pt-26">
      <div className="mx-auto max-w-4xl">
        {/* ============================= HEADER: имя + email ============================= */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
            {session.user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {session.user.name}
            </h1>
            <p className="text-sm text-slate-500">{session.user.email}</p>
          </div>
        </div>

        {/* ============================= STATS: попытки / рекорд / средний балл ============================= */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Попытка саны
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{attemptsCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Рекорд
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {bestScore !== null ? `${bestScore} / ${bestTotal}` : '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Орташа балл
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {avgScore !== null ? avgScore : '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Прогресс
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                progressDelta === null
                  ? 'text-slate-400'
                  : progressDelta > 0
                  ? 'text-emerald-600'
                  : progressDelta < 0
                  ? 'text-red-600'
                  : 'text-slate-900'
              }`}
            >
              {progressDelta === null
                ? '—'
                : progressDelta > 0
                ? `+${progressDelta}`
                : progressDelta}
            </p>
          </div>
        </div>

        {/* ============================= CTA ============================= */}
        <div className="mb-6">
          <Link
            href="/testent"
            className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:shadow-lg"
          >
            Жаңа тест тапсыру →
          </Link>
        </div>

        {/* ============================= PROGRESS CHART ============================= */}
        {chartData.length > 0 && (
          <div className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/40 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Нәтиже динамикасы
              </h2>
              <span className="text-xs text-slate-400">
                Соңғы {chartData.length} тест
              </span>
            </div>
            <ProgressChart data={chartData} />
          </div>
        )}

        {/* ============================= HISTORY ============================= */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/40 md:p-6">
          <h2 className="mb-4 text-sm font-bold tracking-tight text-slate-900">
            Тест тарихы
          </h2>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <p className="text-sm text-slate-400">
                Сіз әлі тест тапсырмадыңыз.
              </p>
              <Link
                href="/testent"
                className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:shadow-lg"
              >
                Тестті бастау
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 md:px-5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {attempt.finishedAt ? formatDate(attempt.finishedAt) : formatDate(attempt.startedAt)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Тапсырма ID: {attempt.id.slice(0, 8)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums ${scoreColor(
                      attempt.score,
                      attempt.total
                    )}`}
                  >
                    {attempt.score} / {attempt.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}