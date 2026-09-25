'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
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

export default function AiTutorQuiz() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ============ ГЕНЕРАЦИЯ ============ */
  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
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
          chatInput: `Сгенерируй тест из 10 вопросов по теме: ${topic}`,
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
    } catch (error) {
      console.error('Тест генерациялауда қате кетті:', error);
      alert('Тест құрастыру мүмкін болмады. Қайтадан байқап көрмекші болыңыз.');
    } finally {
      setLoading(false);
    }
  };

  /* ============ ЖАУАП ТАҢДАУ ============ */
  const handleSelectOption = (questionId: number, option: string) => {
    if (selectedAnswers[questionId]) return; // бір рет қана таңдау
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((score, q) => {
      return selectedAnswers[q.id] === q.correctAnswer ? score + 1 : score;
    }, 0);
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
        setSavedMessage('❌ Сақтау мүмкін болмады');
        return;
      }

      console.log('✅ Нәтиже Neon-ға сақталды');
      setSavedMessage('✅ Нәтиже сақталды');
    } catch (err) {
      console.error('Save fetch error:', err);
      setSavedMessage('❌ Сақтау мүмкін болмады');
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
    saveResults();
  };

  /* ============ ЖАҢА ТЕСТ / БАСТАПҚЫ ЭКРАНҒА ОРАЛУ ============ */
  const resetToStart = () => {
    setQuiz(null);
    setSelectedAnswers({});
    setShowResults(false);
    setSavedMessage('');
    setCurrentIndex(0);
    setTopic('');
  };

  /* ============ НАВИГАЦИЯ ============ */
  const total = quiz?.questions.length ?? 0;
  const currentQuestion = quiz?.questions[currentIndex];
  const currentAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isAnswered = currentAnswer !== undefined;
  const isCorrect = currentQuestion ? currentAnswer === currentQuestion.correctAnswer : false;
  const answeredCount = Object.keys(selectedAnswers).length;

  const goNext = () => {
    if (currentIndex < total - 1) setCurrentIndex((p) => p + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 my-8 pt-16 font-sans">
      {/* ============ HEADER ============ */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        AI Tutor: ЕНТ Тест Генераторы
      </h1>

      {/* ============ INPUT — тек тест әлі жоқта көрінеді ============ */}
      {!quiz && (
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateQuiz()}
            placeholder="Тақырыпты жазыңыз (мысалы: Қазақ хандығы, Пропорция...)"
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={loading}
          />
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Генерациялануда...' : 'Тест жасау'}
          </button>
        </div>
      )}

      {/* ============ QUIZ ============ */}
      {quiz && currentQuestion && (
        <div className="space-y-5">
          {/* TOP BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <span className="font-bold text-gray-900 truncate">{quiz.topic}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 whitespace-nowrap">
                {total} сұрақ
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="px-3 py-1 rounded-full bg-gray-100">
                {answeredCount}/{total} жауап
              </span>
              <button
                onClick={resetToStart}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors font-medium"
                title="Жаңа тест бастау"
              >
                <RotateCcw className="w-3 h-3" />
                Жаңа тест
              </button>
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-bold text-gray-700 uppercase tracking-wide">
                №{currentIndex + 1} сұрақ
              </span>
              <span>1 балл</span>
            </div>

            <p className="text-base font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </p>

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, optIdx) => {
                const letter = LETTERS[optIdx] ?? String(optIdx + 1);
                const isSelected = currentAnswer === opt;
                const isRightAnswer = opt === currentQuestion.correctAnswer;

                let className =
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ';

                if (!isAnswered) {
                  className +=
                    'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer';
                } else if (isRightAnswer) {
                  className += 'border-emerald-300 bg-emerald-50';
                } else if (isSelected) {
                  className += 'border-red-300 bg-red-50';
                } else {
                  className += 'border-gray-200 bg-white opacity-60';
                }

                let badgeClass =
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition ';
                if (!isAnswered) {
                  badgeClass += isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600';
                } else if (isRightAnswer) {
                  badgeClass += 'bg-emerald-500 text-white';
                } else if (isSelected) {
                  badgeClass += 'bg-red-500 text-white';
                } else {
                  badgeClass += 'bg-gray-100 text-gray-500';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    disabled={isAnswered}
                    className={className}
                  >
                    <span className={badgeClass}>{letter}</span>
                    <span className="text-sm font-medium text-gray-800 flex-1">
                      {opt}
                    </span>

                    {isAnswered && isRightAnswer && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Дұрыс жауап
                      </span>
                    )}

                    {isAnswered && isSelected && !isRightAnswer && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 whitespace-nowrap">
                        <XCircle className="w-3.5 h-3.5" />
                        Сіздің жауабыңыз
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXPLANATION (тек жауап берілгенде) */}
          {isAnswered && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Түсіндірме
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isCorrect ? '✓ Дұрыс' : '✕ Қате'}
                </span>
              </div>

              {!isCorrect && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm">
                  <p className="text-red-800">
                    <span className="font-semibold">Сіздің жауабыңыз:</span>{' '}
                    {currentAnswer}
                  </p>
                  <p className="mt-1 text-emerald-800">
                    <span className="font-semibold">Дұрыс жауап:</span>{' '}
                    {currentQuestion.correctAnswer}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>

              {!isCorrect && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Осы сұраққа мұқият болыңыз — келесі тестілеуде ұқсас болуы мүмкін.
                </div>
              )}
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Алдыңғы</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 tabular-nums">
                {currentIndex + 1}/{total}
              </span>
              <div className="hidden sm:block w-32 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {currentIndex < total - 1 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
              >
                <span className="hidden sm:inline">Келесі</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving || showResults}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:bg-gray-400 transition"
              >
                {saving ? 'Сақталуда...' : showResults ? 'Аяқталды' : 'Аяқтау'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============ RESULT MODAL ============ */}
      {showResults && quiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowResults(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center space-y-3 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Жалпы нәтиже
            </p>
            <h3 className="text-4xl font-bold text-indigo-900">
              {calculateScore()} / {total}
            </h3>
            <p className="text-sm text-gray-600">
              {Math.round((calculateScore() / total) * 100)}% дұрыс
            </p>
            {savedMessage && (
              <p className="text-xs text-gray-500">{savedMessage}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
              >
                Жауаптарды қарау
              </button>
              <button
                onClick={resetToStart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
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