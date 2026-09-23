'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import EnhancedFloatingCalculator from '@/components/ui/EnhancedFloatingCalculator';
import { ScratchpadModal } from '@/components/ui/ScratchpadModal';
import { FileText } from 'lucide-react';
import { saveAnswer, finishAttempt } from './actions';

import { BookOpen } from 'lucide-react';
import { FormulaModal } from '@/components/ui/FormulaModal';

/* =========================================================
   TYPES (вопросы теперь приходят с сервера, id — строка/uuid)
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

/* =========================================================
   СТАТИЧНЫЕ НАЗВАНИЯ ПРЕДМЕТОВ (тексты вопросов — с сервера)
========================================================= */

const SUBJECT_META: Record<
  ServerQuestion['subjectId'],
  { title: string; shortTitle: string }
> = {
  history: { title: 'Қазақстан тарихы', shortTitle: 'Тарих' },
  math: { title: 'Математикалық сауаттылық', shortTitle: 'Мат. сауат.' },
  reading: { title: 'Оқу сауаттылығы', shortTitle: 'Оқу сауат.' },
};

// Порядок, в котором предметы показываются в сайдбаре
const SUBJECT_ORDER: ServerQuestion['subjectId'][] = ['history', 'reading', 'math'];

/* =========================================================
   HELPERS
========================================================= */

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

  // ✅ Стейт для модала формул
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  // ✅ Стейт для модала черновика
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  // Оставшееся время считаем от startedAt, присланного сервером —
  // так его нельзя обмануть обновлением страницы или сменой системного времени
  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(initialData.startedAt).getTime()) / 1000);
    return Math.max(totalSeconds - elapsed, 0);
  });

  const finishTriggeredRef = useRef(false);

  /* ---------------- FINISH (объявляем раньше, таймер на неё ссылается) ---------------- */
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
      finishTriggeredRef.current = false; // разрешаем повторную попытку при ошибке сети
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

  /* ---------------- CURRENT DATA ---------------- */
  const currentQuestion = questions[currentIndex];

  const currentSubjectMeta = currentQuestion ? SUBJECT_META[currentQuestion.subjectId] : null;

  // группировка вопросов по предметам — для карты вопросов в сайдбаре
  const questionsBySubject = useMemo(() => {
    const map: Record<string, ServerQuestion[]> = { history: [], reading: [], math: [] };
    for (const q of questions) {
      map[q.subjectId].push(q);
    }
    return map;
  }, [questions]);

  // Какой предмет сейчас раскрыт в навигаторе справа. По умолчанию следует
  // за текущим вопросом, но можно переключить вручную, не покидая вопрос.
  const [sidebarSubject, setSidebarSubject] = useState<ServerQuestion['subjectId']>(
    currentQuestion?.subjectId ?? 'history'
  );
  useEffect(() => {
    if (currentQuestion) setSidebarSubject(currentQuestion.subjectId);
  }, [currentQuestion?.subjectId]);

  const answeredCount = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const isWarning = timeLeft <= 300;

  /* ---------------- HANDLERS ---------------- */
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      const questionId = currentQuestion.id;

      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

      // сохраняем на сервере в фоне; если запрос не удался — ответ всё равно
      // останется в локальном state, а при финальной отправке пересчитывается сервером
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

  /* =========================================================
     RENDER
  ========================================================= */

  if (!currentQuestion && !isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Сұрақтар жүктелмеді. Парақшаны жаңартып көріңіз.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFC] font-sans text-slate-800 pt-32">
      {/* Плавающий калькулятор */}
      <EnhancedFloatingCalculator initialPosition={{ x: 30, y: 30 }} />

      {/* ============================= FLOATING TIMER ============================= */}
      <div className="fixed right-4 top-4 z-40 md:right-6 md:top-6">
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-lg transition-all ${
            isWarning
              ? 'animate-pulse border-red-200 bg-red-50/90 text-red-600 shadow-lg shadow-red-500/10'
              : 'border-[#6960C5]/15 bg-white/90 text-slate-800 shadow-lg shadow-slate-200/50'
          }`}
        >
          <span
            className={`flex h-2 w-2 rounded-full ${isWarning ? 'bg-red-500' : 'bg-[#6960C5]'}`}
          />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Уақыт</span>
            <span className="font-mono text-base font-bold tabular-nums md:text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================= MAIN ============================= */}
      {!isFinished && currentQuestion && (
        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:px-8 lg:grid-cols-12 lg:gap-8 lg:py-10">
          {/* ============================= QUESTION ============================= */}
          <section className="lg:col-span-7">
            {/* Subject chip + question counter */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#6960C5]/10 px-3 py-1.5 text-xs font-semibold text-[#6960C5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6960C5]" />
                {currentSubjectMeta?.title}
              </span>
              <span className="text-xs text-slate-400">
                Сұрақ {currentIndex + 1} / {total}
              </span>
            </div>

            {/* Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/40 md:p-8">
              {/* Question text */}
              <div className="mb-8 rounded-2xl bg-[#6960C5]/5 p-5 md:p-6">
                <p className="text-base font-medium leading-relaxed text-slate-800 md:text-lg">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`group flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 md:px-5 md:py-4 ${
                        isSelected
                          ? 'border-[#6960C5] bg-[#6960C5]/[0.06] shadow-md shadow-[#6960C5]/10'
                          : 'border-slate-200 bg-white hover:border-[#6960C5]/40 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase transition-all ${
                          isSelected
                            ? 'bg-[#6960C5] text-white shadow-md shadow-[#6960C5]/30'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-white'
                        }`}
                      >
                        {opt.id}
                      </span>

                      <span
                        className={`text-sm md:text-base ${
                          isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {opt.text}
                      </span>

                      {isSelected && (
                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#6960C5] text-xs text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Артқа
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === total - 1}
                  className="flex items-center gap-2 rounded-xl bg-[#6960C5] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6960C5]/30 transition hover:bg-[#5A51B0] hover:shadow-lg hover:shadow-[#6960C5]/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Келесі →
                </button>
              </div>
            </div>

            {/* Formula + Scratchpad banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-700">
                  Стандартты формулалар мен ережелер анықтамалығы
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsFormulaOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  Анықтамалық
                </button>

                <button
                  onClick={() => setIsScratchpadOpen(true)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Черновик</span>
                </button>
              </div>
            </div>
          </section>

          {/* ============================= SIDEBAR ============================= */}
          <aside className="lg:col-span-4 pt-10">
            <div className="sticky top-6 space-y-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-200/40 md:p-6">
              {/* Progress — теперь всегда первый блок сверху */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">Прогресс</span>
                  <span className="text-[11px] tabular-nums text-slate-600">
                    {answeredCount}/{total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#6960C5] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Finish button — сразу под прогрессом, всегда на виду */}
              <button
                onClick={() => setShowFinishModal(true)}
                disabled={isFinishing}
                className="w-full rounded-2xl bg-[#6960C5] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#6960C5]/30 transition hover:bg-[#5A51B0] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFinishing ? 'Жіберілуде...' : 'Тестті аяқтау'}
              </button>

              {/* Subject switcher — предметы сгруппированы во вкладки, вместо трёх списков подряд */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold tracking-tight text-slate-900">
                  Сұрақтар картасы
                </h3>

                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
                  {SUBJECT_ORDER.map((subjectId) => {
                    const subjectQuestions = questionsBySubject[subjectId];
                    if (!subjectQuestions || subjectQuestions.length === 0) return null;
                    const meta = SUBJECT_META[subjectId];
                    const isTabActive = sidebarSubject === subjectId;
                    const answeredInSubject = subjectQuestions.filter((q) => !!answers[q.id]).length;

                    return (
                      <button
                        key={subjectId}
                        onClick={() => setSidebarSubject(subjectId)}
                        className={`rounded-lg px-2 py-2 text-center transition-all ${
                          isTabActive
                            ? 'bg-white text-[#6960C5] shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <div className="text-[11px] font-semibold leading-tight">
                          {meta.shortTitle}
                        </div>
                        <div className="mt-0.5 text-[10px] tabular-nums text-slate-400">
                          {answeredInSubject}/{subjectQuestions.length}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Сетка вопросов только активного (выбранного) предмета */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {questionsBySubject[sidebarSubject]?.map((q, localIdx) => {
                    const globalIndex = questions.findIndex((item) => item.id === q.id);
                    const isAnswered = !!answers[q.id];
                    const isCurrent = currentIndex === globalIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(globalIndex)}
                        className={`relative flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isCurrent
                            ? 'bg-[#6960C5] text-white shadow-md shadow-[#6960C5]/30'
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

              {/* Legend — компактной строкой внизу, а не тремя отдельными строками */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-md border border-slate-200 bg-white" />
                  Жауапсыз
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-md border border-emerald-200 bg-emerald-50" />
                  Жауап берілген
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-md bg-[#6960C5]" />
                  Қазіргі
                </span>
              </div>
            </div>
          </aside>
        </main>
      )}

      {/* ============================= FINISH MODAL ============================= */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              ⚠️
            </div>

            <h3 className="text-lg font-bold tracking-tight text-slate-900">Тестті аяқтау?</h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Аяқтағаннан кейін жауаптарды өзгерте алмайсыз. Нәтиже автоматты
              түрде есептеледі.
            </p>

            {answeredCount < total && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-sm font-semibold text-amber-800">Назар аударыңыз</p>
                <p className="mt-1 text-xs text-amber-700">
                  Сіз {total - answeredCount} сұраққа жауап бермедіңіз.
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Жалғастыру
              </button>
              <button
                onClick={handleConfirmFinish}
                disabled={isFinishing}
                className="flex-1 rounded-2xl bg-[#6960C5] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#6960C5]/30 transition hover:bg-[#5A51B0] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFinishing ? 'Жіберілуде...' : 'Аяқтау'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================= SUCCESS SCREEN ============================= */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6960C5]/5 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6960C5] text-2xl text-white shadow-lg shadow-[#6960C5]/30">
              ✓
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Тест аяқталды!</h2>
            {result && (
              <p className="mt-2 text-lg font-semibold text-[#6960C5]">
                Нәтиже: {result.score} / {result.total}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              Жауаптарыңыз сәтті жіберілді. Нәтижені профильден де көре аласыз.
            </p>

            <button
              onClick={() => (window.location.href = '/profile')}
              className="mt-6 w-full rounded-2xl bg-[#6960C5] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#6960C5]/30 transition hover:bg-[#5A51B0] hover:shadow-lg"
            >
              Профильге өту
            </button>
          </div>
        </div>
      )}

      {/* ============================= FORMULA MODAL ============================= */}
      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

      {/* ============================= SCRATCHPAD MODAL ============================= */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />
    </div>
  );
}