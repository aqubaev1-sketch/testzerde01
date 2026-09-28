'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  FileText,
} from 'lucide-react';
import EnhancedFloatingCalculator from '@/components/ui/EnhancedFloatingCalculator';
import { ScratchpadModal } from '@/components/ui/ScratchpadModal';
import { FormulaModal } from '@/components/ui/FormulaModal';
import { saveAnswer, finishAttempt } from './actions';

/* =========================================================
   TYPES (вопросы приходят с сервера, id — строка/uuid)
========================================================= */

export interface ServerQuestion {
  id: string;
  subjectId: 'history' | 'math' | 'reading';
  questionText: string;
  options: { id: string; text: string }[];
}

export interface InitialData {
  attemptId: string;
  questions: ServerQuestion[];
  answers: Record<string, string>;
  startedAt: string; // ISO строка
  status: 'in_progress' | 'finished';
  score: number | null;
  totalSeconds: number;
}

interface TestEContentProps {
  initialData: InitialData;
}

const SUBJECT_META: Record<ServerQuestion['subjectId'], { title: string; shortTitle: string }> = {
  history: { title: 'Қазақстан тарихы', shortTitle: 'Тарих' },
  math: { title: 'Математикалық сауаттылық', shortTitle: 'Мат. сауат.' },
  reading: { title: 'Оқу сауаттылығы', shortTitle: 'Оқу сауат.' },
};

const SUBJECT_ORDER: ServerQuestion['subjectId'][] = ['history', 'reading', 'math'];

const BRAND = '#6960C5';

function formatTime(seconds: number) {
  const clamped = Math.max(0, seconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* =========================================================
   MAIN CONTENT
========================================================= */

export default function TestEContent({ initialData }: TestEContentProps) {
  const { attemptId, questions, totalSeconds } = initialData;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialData.answers || {});
  const [isFinished, setIsFinished] = useState(initialData.status === 'finished');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    initialData.status === 'finished' && initialData.score !== null
      ? { score: initialData.score, total }
      : null
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Оставшееся время считаем от startedAt, присланного сервером
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(initialData.startedAt).getTime()) / 1000);
    return Math.max(totalSeconds - elapsed, 0);
  });

  const finishTriggeredRef = useRef(false);

  /* ---------------- FINISH ---------------- */
  const handleConfirmFinish = useCallback(async () => {
    if (finishTriggeredRef.current) return;
    finishTriggeredRef.current = true;

    setShowFinishModal(false);
    setIsFinishing(true);
    try {
      const res = await finishAttempt(attemptId);
      setResult(res);
      setIsFinished(true);
    } catch (err) {
      console.error('Тестті аяқтау кезінде қате шықты:', err);
      finishTriggeredRef.current = false;
    } finally {
      setIsFinishing(false);
    }
  }, [attemptId]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft <= 0) {
      handleConfirmFinish();
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isFinished, handleConfirmFinish]);

  /* ---------------- Escape закрывает окно подтверждения ---------------- */
  useEffect(() => {
    if (!showFinishModal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowFinishModal(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFinishModal]);

  /* ---------------- CURRENT DATA ---------------- */
  const currentQuestion = questions[currentIndex];
  const currentSubjectMeta = currentQuestion ? SUBJECT_META[currentQuestion.subjectId] : null;

  const questionsBySubject = useMemo(() => {
    const map: Record<string, ServerQuestion[]> = { history: [], reading: [], math: [] };
    for (const q of questions) map[q.subjectId].push(q);
    return map;
  }, [questions]);

  const [sidebarSubject, setSidebarSubject] = useState<ServerQuestion['subjectId']>(
    currentQuestion?.subjectId ?? 'history'
  );
  useEffect(() => {
    if (currentQuestion) setSidebarSubject(currentQuestion.subjectId);
  }, [currentQuestion?.subjectId]);

  const answeredCount = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const isWarning = timeLeft <= 300;
  const isCritical = timeLeft <= 60;
  const isLast = currentIndex === total - 1;

  /* ---------------- HANDLERS ---------------- */
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      const questionId = currentQuestion.id;

      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

      saveAnswer(attemptId, questionId, optionId).catch((err) => {
        console.error('Жауапты сақтау кезінде қате:', err);
      });
    },
    [attemptId, currentQuestion]
  );

  const handleNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((p) => p + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  };

  if (!currentQuestion && !isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-slate-500">
        Сұрақтар жүктелмеді. Парақшаны жаңартып көріңіз.
      </div>
    );
  }

  const percent = result && result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const ringColor = percent >= 70 ? '#10b981' : percent >= 40 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="relative min-h-screen bg-slate-50 pb-16 pt-28 font-sans text-slate-800 md:pt-32">
      <style>{`
        .q-fade{animation:qFade .25s ease-out both}
        @keyframes qFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes timerPulse{50%{opacity:.55}}
        @media (prefers-reduced-motion:reduce){.q-fade{animation:none}.timer-critical{animation:none!important}}
      `}</style>

      <EnhancedFloatingCalculator initialPosition={{ x: 30, y: 30 }} />

      {/* ============================= TIMER ============================= */}
      <div className="fixed right-4 top-4 z-40 md:right-6 md:top-6" role="timer" aria-label="Қалған уақыт">
        <div
          className={`timer-critical flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-lg transition-colors ${
            isWarning
              ? 'border-red-200 bg-red-50/95 text-red-600 shadow-red-500/10'
              : 'border-slate-200 bg-white/95 text-slate-800 shadow-slate-200/60'
          }`}
          style={isCritical ? { animation: 'timerPulse 1s ease-in-out infinite' } : undefined}
        >
          <Clock className={`h-4 w-4 shrink-0 ${isWarning ? 'text-red-500' : 'text-[#6960C5]'}`} />
          <div className="leading-none">
            <p className="text-[11px] text-slate-500">Қалған уақыт</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatTime(timeLeft)}</p>
          </div>
        </div>
      </div>

      {/* ============================= MAIN ============================= */}
      {!isFinished && currentQuestion && (
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:px-8 lg:grid-cols-12 lg:gap-8">
          {/* ---------- QUESTION ---------- */}
          <section className="min-w-0 lg:col-span-8">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-[#6960C5]">
                {currentSubjectMeta?.title}
              </p>
              <p className="shrink-0 text-sm tabular-nums text-slate-500">
                {currentIndex + 1} / {total}
              </p>
            </div>

            <div
              key={currentQuestion.id}
              className="q-fade rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
            >
              <p className="whitespace-pre-line text-lg font-semibold leading-relaxed text-slate-900 [overflow-wrap:anywhere] md:text-xl">
                {currentQuestion.questionText}
              </p>

              <div className="mt-6 space-y-3" role="radiogroup" aria-label="Жауап нұсқалары">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`group flex w-full min-w-0 items-start gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition md:px-5 md:py-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6960C5]/25 ${
                        isSelected
                          ? 'border-[#6960C5] bg-[#6960C5]/[0.06]'
                          : 'border-slate-200 bg-white hover:border-[#6960C5]/50 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase transition ${
                          isSelected
                            ? 'bg-[#6960C5] text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                        }`}
                      >
                        {opt.id}
                      </span>

                      <span
                        className={`min-w-0 flex-1 self-center text-sm [overflow-wrap:anywhere] md:text-base ${
                          isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {opt.text}
                      </span>

                      {isSelected && (
                        <Check className="h-5 w-5 shrink-0 self-center text-[#6960C5]" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:flex sm:items-center sm:justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Артқа
                </button>

                {isLast ? (
                  <button
                    onClick={() => setShowFinishModal(true)}
                    disabled={isFinishing}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
                  >
                    {isFinishing ? (
                      'Жіберілуде...'
                    ) : (
                      <>
                        <span className="sm:hidden">Аяқтау</span>
                        <span className="hidden sm:inline">Тестті аяқтау</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#6960C5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A51B0] active:scale-[0.98] sm:w-auto"
                  >
                    Келесі
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Инструменты */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsFormulaOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#6960C5]/40 hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4 text-slate-500" />
                Формулалар анықтамалығы
              </button>
              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#6960C5]/40 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                Черновик
              </button>
            </div>
          </section>

          {/* ---------- SIDEBAR ---------- */}
          <aside className="min-w-0 lg:col-span-4 pt-8">
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 lg:sticky lg:top-28">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-600">Жауап берілді</span>
                  <span className="text-sm tabular-nums text-slate-500">
                    {answeredCount} / {total}
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[#6960C5] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFinishModal(true)}
                disabled={isFinishing}
                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFinishing ? 'Жіберілуде...' : 'Тестті аяқтау'}
              </button>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold tracking-tight text-slate-900">Сұрақтар картасы</h3>

                <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
                  {SUBJECT_ORDER.map((subjectId) => {
                    const list = questionsBySubject[subjectId];
                    if (!list || list.length === 0) return null;
                    const meta = SUBJECT_META[subjectId];
                    const active = sidebarSubject === subjectId;
                    const done = list.filter((q) => !!answers[q.id]).length;

                    return (
                      <button
                        key={subjectId}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSidebarSubject(subjectId)}
                        className={`rounded-lg px-2 py-2 text-center transition ${
                          active ? 'bg-white text-[#6960C5] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-semibold leading-tight">{meta.shortTitle}</div>
                        <div className="mt-0.5 text-[11px] tabular-nums text-slate-400">
                          {done}/{list.length}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="mt-4 grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(
                      questionsBySubject[sidebarSubject]?.length || 1,
                      10
                    )}, minmax(0, 1fr))`,
                  }}
                >
                  {questionsBySubject[sidebarSubject]?.map((q, localIdx) => {
                    const globalIndex = questions.findIndex((item) => item.id === q.id);
                    const isAnswered = !!answers[q.id];
                    const isCurrent = currentIndex === globalIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(globalIndex)}
                        aria-label={`${localIdx + 1}-сұрақ${isAnswered ? ', жауап берілген' : ''}`}
                        aria-current={isCurrent ? 'true' : undefined}
                        className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition sm:text-sm ${
                          isCurrent
                            ? 'bg-[#6960C5] text-white'
                            : isAnswered
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {localIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-slate-200 bg-white" />
                  Жауапсыз
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" />
                  Жауап берілген
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded" style={{ backgroundColor: BRAND }} />
                  Қазіргі
                </span>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* ============================= FINISH MODAL ============================= */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Тестті аяқтау"
            className="q-fade max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6 md:p-7"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <h3 className="text-lg font-bold tracking-tight text-slate-900">Тестті аяқтау?</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Аяқтағаннан кейін жауаптарды өзгерте алмайсыз. Нәтиже автоматты түрде есептеледі.
            </p>

            {answeredCount < total && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  {total - answeredCount} сұраққа жауап берілмеген
                </p>
                <p className="mt-1 text-xs text-amber-700">Оларға қайта оралуға әлі уақыт бар.</p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowFinishModal(false)}
                className="w-full whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-1"
              >
                Жалғастыру
              </button>
              <button
                onClick={handleConfirmFinish}
                disabled={isFinishing}
                className="w-full whitespace-nowrap rounded-xl bg-[#6960C5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5A51B0] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              >
                {isFinishing ? 'Жіберілуде...' : 'Аяқтау'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================= RESULT ============================= */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-50 p-4">
          <div className="q-fade w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            {result ? (
              <div className="relative mx-auto h-36 w-36">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - percent / 100)}
                    style={{ transition: 'stroke-dashoffset .9s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums text-slate-900">
                    {result.score}/{result.total}
                  </span>
                  <span className="text-xs text-slate-500">{percent}% дұрыс</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-8 w-8" />
              </div>
            )}

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Тест аяқталды</h2>
            <p className="mt-2 text-sm text-slate-500">
              Жауаптарыңыз жіберілді. Нәтижені профильден де көре аласыз.
            </p>

            <Link
              href="/profile"
              className="mt-6 block w-full rounded-xl bg-[#6960C5] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5A51B0]"
            >
              Профильге өту
            </Link>
          </div>
        </div>
      )}

      <FormulaModal isOpen={isFormulaOpen} onClose={() => setIsFormulaOpen(false)} />
      <ScratchpadModal isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />
    </div>
  );
}