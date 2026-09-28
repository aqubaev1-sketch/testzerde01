'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  topic: string;
  questions: Question[];
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const SUGGESTIONS = ['Қазақ хандығы', 'Пропорция', 'Қазақстан тарихы', 'Алгебра'];

const LOADING_STEPS = [
  'Тақырып талданып жатыр',
  'Сұрақтар құрастырылуда',
  'Жауап нұсқалары таңдалуда',
  'Түсіндірмелер жазылуда',
];

/* ============ LOADING: ЕНТ жауап парағы толтырылып жатыр ============ */
function AnswerSheetLoader({ topic }: { topic: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const rows = 6;
  const filled = [1, 3, 0, 2, 3, 1]; // қай нұсқа боялады

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        {/* Жауап парағы */}
        <div
          className="relative shrink-0 w-52 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 overflow-hidden"
          aria-hidden="true"
        >
          <div className="sheet-scan" />
          <div className="space-y-2.5">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex items-center gap-2">
                <span className="w-4 text-[10px] font-semibold tabular-nums text-slate-400">
                  {r + 1}
                </span>
                {[0, 1, 2, 3].map((c) => (
                  <span
                    key={c}
                    className={`bubble ${filled[r] === c ? 'bubble-fill' : ''}`}
                    style={filled[r] === c ? { animationDelay: `${r * 0.45}s` } : undefined}
                  >
                    {LETTERS[c]}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Мәтін */}
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-sm text-slate-500">Тест жасалуда</p>
          <p className="mt-1 text-xl font-bold text-slate-900 [overflow-wrap:anywhere]">{topic}</p>

          <div className="mt-5 h-6 relative" role="status" aria-live="polite">
            <p key={step} className="step-text absolute inset-0 text-sm font-medium text-indigo-600">
              {LOADING_STEPS[step]}
              <span className="dots" />
            </p>
          </div>

          <div className="mt-4 h-1.5 w-full sm:w-64 rounded-full bg-slate-100 overflow-hidden">
            <div className="progress-indeterminate h-full w-1/3 rounded-full bg-indigo-500" />
          </div>
          <p className="mt-3 text-xs text-slate-400">Әдетте 10–20 секунд алады</p>
        </div>
      </div>
    </div>
  );
}

export default function AiTutorQuiz() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ============ ГЕНЕРАЦИЯ ============ */
  const generateQuiz = async (override?: string) => {
    const t = (override ?? topic).trim();
    if (!t || loading) return;
    setTopic(t);
    setLoading(true);
    setError('');
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setSavedMessage('');
    setCurrentIndex(0);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: `Сгенерируй тест из 10 вопросов по теме: ${t}`,
          sessionId: `quiz_${Date.now()}`,
        }),
      });

      if (!res.ok) throw new Error(`HTTP қате: ${res.status}`);

      const data = await res.json();

      let parsedQuiz: QuizData;
      if (typeof data === 'string') parsedQuiz = JSON.parse(data);
      else if (typeof data.output === 'string') parsedQuiz = JSON.parse(data.output);
      else if (data.output && typeof data.output === 'object') parsedQuiz = data.output;
      else parsedQuiz = data;

      setQuiz(parsedQuiz);
    } catch (err) {
      console.error('Тест генерациялауда қате кетті:', err);
      setError('Тест құрастыру мүмкін болмады. Қайтадан байқап көріңіз.');
    } finally {
      setLoading(false);
    }
  };

  /* ============ ЖАУАП ТАҢДАУ ============ */
  const handleSelectOption = (questionId: number, option: string) => {
    if (selectedAnswers[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce(
      (score, q) => (selectedAnswers[q.id] === q.correctAnswer ? score + 1 : score),
      0
    );
  };

  /* ============ САҚТАУ ============ */
  const saveResults = async () => {
    if (!quiz) return;
    const score = calculateScore();

    setSaving(true);
    setSavedMessage('');

    try {
      const res = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quiz.topic,
          score,
          total: quiz.questions.length,
          answers: selectedAnswers,
          questions: quiz.questions,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Сақтау қатесі:', err);
        setSavedMessage('Нәтижені сақтау мүмкін болмады');
        return;
      }

      setSavedMessage('Нәтиже сақталды');
    } catch (err) {
      console.error('Save fetch error:', err);
      setSavedMessage('Нәтижені сақтау мүмкін болмады');
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
    saveResults();
  };

  const resetToStart = () => {
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setSavedMessage('');
    setCurrentIndex(0);
    setTopic('');
    setError('');
  };

  /* ============ НАВИГАЦИЯ ============ */
  const total = quiz?.questions.length ?? 0;
  const currentQuestion = quiz?.questions[currentIndex];
  const currentAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isCorrect = currentQuestion ? currentAnswer === currentQuestion.correctAnswer : false;
  const answeredCount = Object.keys(selectedAnswers).length;
  const score = calculateScore();
  const percent = total ? Math.round((score / total) * 100) : 0;

  const goNext = () => currentIndex < total - 1 && setCurrentIndex((p) => p + 1);
  const goPrev = () => currentIndex > 0 && setCurrentIndex((p) => p - 1);

  return (
    <div className="w-full min-w-0 max-w-3xl mx-auto p-3 sm:p-4 md:p-6 my-4 sm:my-8 pt-16 font-sans break-words">
      <style>{`
        .bubble{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;border:1.5px solid #cbd5e1;background:#fff;font-size:10px;font-weight:600;color:#94a3b8}
        .bubble-fill{animation:bubbleFill 3.2s ease-in-out infinite}
        @keyframes bubbleFill{0%,8%{background:#fff;border-color:#cbd5e1;color:#94a3b8;transform:scale(1)}18%{transform:scale(1.15)}26%,80%{background:#4f46e5;border-color:#4f46e5;color:#4f46e5;transform:scale(1)}92%,100%{background:#fff;border-color:#cbd5e1;color:#94a3b8}}
        .sheet-scan{position:absolute;left:0;right:0;height:36px;top:-36px;background:linear-gradient(to bottom,transparent,rgba(99,102,241,.14),transparent);animation:scan 3.2s linear infinite}
        @keyframes scan{to{transform:translateY(260px)}}
        .step-text{animation:stepIn .45s ease-out both}
        @keyframes stepIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .dots::after{content:'';animation:dots 1.4s steps(4,end) infinite}
        @keyframes dots{0%{content:''}25%{content:'.'}50%{content:'..'}75%,100%{content:'...'}}
        .progress-indeterminate{animation:slide 1.4s ease-in-out infinite}
        @keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
        .q-enter{animation:qIn .3s ease-out both}
        @keyframes qIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){
          .bubble-fill{animation:none;background:#4f46e5;border-color:#4f46e5;color:#4f46e5}
          .sheet-scan,.progress-indeterminate,.step-text,.q-enter{animation:none}
          .dots::after{animation:none;content:'...'}
        }
      `}</style>

      {/* ============ HEADER ============ */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          ЕНТ тест генераторы
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Тақырыпты жазыңыз — AI Tutor 10 сұрақтан тұратын тест жасайды.
        </p>
      </header>

      {/* ============ INPUT ============ */}
      {!quiz && !loading && (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <label htmlFor="topic" className="block text-sm font-semibold text-slate-800 mb-2">
            Тест тақырыбы
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
                placeholder="Мысалы: Қазақ хандығы"
                className="w-full min-w-0 pl-10 pr-3 py-3 text-sm sm:text-base rounded-xl border border-slate-200 bg-slate-50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={() => generateQuiz()}
              disabled={!topic.trim()}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              <Sparkles className="w-4 h-4" />
              Тест жасау
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => generateQuiz(s)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </section>
      )}

      {/* ============ LOADING ============ */}
      {loading && <AnswerSheetLoader topic={topic} />}

      {/* ============ QUIZ ============ */}
      {quiz && currentQuestion && (
        <div className="space-y-4 min-w-0">
          {/* TOP BAR */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{quiz.topic}</p>
                <p className="text-xs text-slate-500">
                  {answeredCount} / {total} сұраққа жауап берілді
                </p>
              </div>
              <button
                onClick={resetToStart}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Жаңа тест
              </button>
            </div>

            {/* Сұрақтар картасы: әр сегмент — бір сұрақ */}
            <div className="mt-3 flex gap-1" role="tablist" aria-label="Сұрақтар">
              {quiz.questions.map((q, i) => {
                const a = selectedAnswers[q.id];
                const color =
                  a === undefined
                    ? 'bg-slate-200'
                    : a === q.correctAnswer
                    ? 'bg-emerald-500'
                    : 'bg-red-500';
                return (
                  <button
                    key={q.id}
                    role="tab"
                    aria-selected={i === currentIndex}
                    aria-label={`${i + 1}-сұрақ`}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 flex-1 rounded-full transition-all ${color} ${
                      i === currentIndex ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:opacity-70'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* QUESTION CARD */}
          <div
            key={currentQuestion.id}
            className="q-enter rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5 min-w-0"
          >
            <p className="text-xs font-semibold text-indigo-600">
              {currentIndex + 1}-сұрақ · {total} сұрақтың ішінен
            </p>

            <p className="text-lg font-semibold leading-relaxed text-slate-900 [overflow-wrap:anywhere]">
              {currentQuestion.question}
            </p>

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, optIdx) => {
                const letter = LETTERS[optIdx] ?? String(optIdx + 1);
                const isSelected = currentAnswer === opt;
                const isRightAnswer = opt === currentQuestion.correctAnswer;

                let cls =
                  'w-full min-w-0 flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl border-2 text-left transition ';
                let badge =
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ';

                if (!isAnswered) {
                  cls +=
                    'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer';
                  badge += 'bg-slate-100 text-slate-600';
                } else if (isRightAnswer) {
                  cls += 'border-emerald-400 bg-emerald-50';
                  badge += 'bg-emerald-500 text-white';
                } else if (isSelected) {
                  cls += 'border-red-400 bg-red-50';
                  badge += 'bg-red-500 text-white';
                } else {
                  cls += 'border-slate-200 bg-white opacity-50';
                  badge += 'bg-slate-100 text-slate-500';
                }

                return (
                  <button
                    key={`${optIdx}-${opt}`}
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    disabled={isAnswered}
                    className={cls}
                  >
                    <span className={badge}>{letter}</span>
                    <span className="flex-1 min-w-0 text-sm font-medium text-slate-800 [overflow-wrap:anywhere]">
                      {opt}
                    </span>
                    {isAnswered && isRightAnswer && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline whitespace-nowrap">Дұрыс жауап</span>
                        <span className="sr-only sm:hidden">Дұрыс жауап</span>
                      </span>
                    )}
                    {isAnswered && isSelected && !isRightAnswer && (
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline whitespace-nowrap">Сіздің жауабыңыз</span>
                        <span className="sr-only sm:hidden">Сіздің жауабыңыз</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPLANATION */}
          {isAnswered && (
            <div
              className={`q-enter rounded-2xl border p-4 sm:p-5 space-y-2 min-w-0 ${
                isCorrect ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />
                {isCorrect ? 'Дұрыс! Түсіндірме' : 'Қате. Дұрыс жауап: ' + currentQuestion.correctAnswer}
              </div>
              <p className="text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              aria-label="Алдыңғы"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Алдыңғы</span>
            </button>

            {currentIndex < total - 1 ? (
              <button
                onClick={goNext}
                aria-label="Келесі"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98] transition"
              >
                Келесі
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving || showResults}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-300 transition whitespace-nowrap"
              >
                {saving ? 'Сақталуда...' : showResults ? 'Аяқталды' : 'Тестті аяқтау'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============ RESULT MODAL ============ */}
      {showResults && quiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setShowResults(false)}
        >
          <div
            className="q-enter w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={percent >= 70 ? '#10b981' : percent >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - percent / 100)}
                  style={{ transition: 'stroke-dashoffset .8s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">
                  {score}/{total}
                </span>
                <span className="text-xs text-slate-500">{percent}% дұрыс</span>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800 [overflow-wrap:anywhere]">
              {quiz.topic}
            </p>
            {savedMessage && <p className="mt-1 text-xs text-slate-500">{savedMessage}</p>}

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Жауаптарды қарау
              </button>
              <button
                onClick={resetToStart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Жаңа тест
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}