'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle2, Clock3, Loader2, Play } from 'lucide-react';
import { getOrCreateAttempt } from './actions';
import TestEContent, { type InitialData } from './TestEContent';

const TEST_SECTIONS = [
  { label: 'Қазақстан тарихы', count: 20 },
  { label: 'Оқу сауаттылығы', count: 10 },
  { label: 'Математикалық сауаттылық', count: 10 },
];

export default function TestStart() {
  const [attempt, setAttempt] = useState<InitialData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (isStarting) return;
    setIsStarting(true);
    setError(null);

    try {
      const data = await getOrCreateAttempt();
      setAttempt(data);
    } catch (startError) {
      console.error('Тестті бастау кезінде қате шықты:', startError);
      setError('Тестті жүктеу мүмкін болмады. Қайтадан байқап көріңіз.');
    } finally {
      setIsStarting(false);
    }
  }

  if (attempt) return <TestEContent initialData={attempt} />;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 text-slate-900 md:pt-32">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-gradient-to-br from-[#5B57F5] to-[#7C5CE7] px-6 py-9 text-white md:px-10 md:py-12">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mb-2 text-sm font-semibold text-indigo-100">ҰБТ тренажері</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
            Тестті бастауға дайынсыз ба?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
            «Тестті бастау» батырмасын басқаннан кейін сұрақтар жүктеліп, уақыт санағы
            басталады.
          </p>
        </div>

        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1fr_0.9fr] md:px-10 md:py-10">
          <div>
            <h2 className="text-lg font-bold">Тест құрамы</h2>
            <div className="mt-4 space-y-3">
              {TEST_SECTIONS.map((section) => (
                <div
                  key={section.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-700">{section.label}</span>
                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-[#5B57F5]">
                    {section.count} сұрақ
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5 md:p-6">
            <h2 className="text-lg font-bold">Маңызды ақпарат</h2>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
              <li className="flex gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#5B57F5]" aria-hidden="true" />
                <span>Тест уақыты — 1 сағат 30 минут.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                <span>Жауаптар таңдалған сәтте автоматты түрде сақталады.</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                <span>Аяқталмаған тестке кейін қайта кіріп, жалғастыруға болады.</span>
              </li>
            </ul>

            {error && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B57F5] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#4D49E8] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:cursor-wait disabled:opacity-70"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Тест дайындалуда…
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" aria-hidden="true" />
                  Тестті бастау
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
