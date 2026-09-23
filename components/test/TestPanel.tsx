'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, AlertTriangle } from 'lucide-react';

const OPTIONS = [
  { id: 'A', text: 'x = 7' },
  { id: 'B', text: 'x = 5' },
  { id: 'C', text: 'x = 8' },
  { id: 'D', text: 'x = –5, x = 7' },
];

export default function TestPanel() {
  const [selected, setSelected] = useState<string | null>('B');
  const [current, setCurrent] = useState(18);
  const total = 40;

  return (
    <div className="space-y-5">
      {/* Верхняя плашка */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-xs">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-bold text-gray-900">Математикалық сауаттылық</span>
          <span className="text-gray-400">·</span>
          <span>Логарифмдер</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="px-3 py-1 rounded-full bg-gray-100">Орташа деңгей</span>
          <span className="font-mono font-bold text-red-500">01:41:22</span>
        </div>
      </div>

      {/* Карточка вопроса */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-bold text-gray-700 uppercase tracking-wide">
            №{current} сұрақ
          </span>
          <span>1 балл</span>
        </div>

        <p className="text-base font-semibold text-gray-900">
          Теңдеуді шешіңіз:{' '}
          <span className="font-mono bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
            log₂(x − 3) + log₂(x + 1) = 5
          </span>
        </p>

        <div className="space-y-2.5">
          {OPTIONS.map((o) => {
            const active = selected === o.id;
            const isCorrect = o.id === 'B';
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  active
                    ? isCorrect
                      ? 'border-red-300 bg-red-50'
                      : 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    active ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {o.id}
                </span>
                <span className="text-sm font-medium text-gray-800">{o.text}</span>
                {active && isCorrect && (
                  <span className="ml-auto text-[11px] font-bold text-red-600">
                    Таңдалған жауап · Қате
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Разбор ошибки */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Түсіндірме: Қате қай жерде кетті?
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
            Қате анықталды
          </span>
        </div>

        <ol className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <li className="flex gap-2">
            <span className="font-bold text-indigo-600">1.</span>
            Логарифмдердің қосынды қасиеті: log₂(M) + log₂(N) = log₂(M·N)
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-indigo-600">2.</span>
            Негізгі теңдеуді шешу: log₂((x − 3)(x + 1)) = 5 ⇒ (x − 3)(x + 1) = 32 ⇒
            x² − 2x − 35 = 0
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-indigo-600">3.</span>
            Анықталу облысы (ОДЗ) және тексеру: x = 7 ⇒ x − 3 &gt; 0 және x + 1 &gt; 0
            ⇒ x &gt; 3
          </li>
        </ol>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Ұқсас қателіктер алдыңғы 2 тестілеуде қайталанған.
        </div>

        <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold">
          Ұқсас 3 есепті шешу →
        </button>
      </div>

      {/* Навигация */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-xs">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Алдыңғы сұрақ
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 tabular-nums">
            {current}/{total}
          </span>
          <div className="hidden sm:block w-32 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-slate-900"
              style={{ width: `${(current / total) * 100}%` }}
            />
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold">
          Келесі сұрақ
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}