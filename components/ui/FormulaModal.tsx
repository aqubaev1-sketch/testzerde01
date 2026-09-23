'use client';

import React, { useState } from 'react';
import { X, BookOpen, Percent, Divide, Sigma, Compass } from 'lucide-react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormulaModal({ isOpen, onClose }: FormulaModalProps) {
  const [activeCategory, setActiveCategory] = useState<'percent' | 'log' | 'trig' | 'geom'>('percent');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">Формулалар анықтамалығы</h3>
              <p className="text-xs text-zinc-500">Математикалық сауаттылық және бейіндік математика</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-100 px-5 gap-3 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('percent')}
            className={`pb-2.5 px-1 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeCategory === 'percent'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Percent className="w-3 h-3" /> Проценттер
          </button>
          <button
            onClick={() => setActiveCategory('log')}
            className={`pb-2.5 px-1 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeCategory === 'log'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Divide className="w-3 h-3" /> Логарифмдер
          </button>
          <button
            onClick={() => setActiveCategory('trig')}
            className={`pb-2.5 px-1 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeCategory === 'trig'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Sigma className="w-3 h-3" /> Тригонометрия
          </button>
          <button
            onClick={() => setActiveCategory('geom')}
            className={`pb-2.5 px-1 text-xs font-medium flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeCategory === 'geom'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Compass className="w-3 h-3" /> Геометрия
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-zinc-800">
          {activeCategory === 'percent' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <h4 className="font-semibold text-zinc-900 text-xs mb-1">№29 есепке қатысты заңдылық (Күрделі процент)</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Баға алдымен +p%-ға артып, кейін жаңа баға -q%-ға кемісе:
                </p>
                <div className="bg-white p-2.5 rounded-lg font-mono text-xs my-2 text-zinc-900 border border-zinc-200">
                  P₂ = P₀ · (1 + p/100) · (1 - q/100)
                </div>
                <p className="text-xs text-zinc-600">
                  Егер P₀ = 100 болса: P₁ = 100 · 1.25 = 125. Одан кейін 20% арзандату: P₂ = 125 · 0.80 = 100.
                  Нәтиже: Баға <strong>өзгерген жоқ</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="font-medium text-zinc-900 mb-1">Процентті табу</div>
                  <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900 mb-1">
                    B = A · (P / 100)
                  </div>
                  <p className="text-zinc-500">A санының P проценті</p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <div className="font-medium text-zinc-900 mb-1">Проценттік қатынас</div>
                  <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900 mb-1">
                    P = (A / B) · 100%
                  </div>
                  <p className="text-zinc-500">A саны B-ның қанша процентін құрайды</p>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'log' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <h4 className="font-semibold text-zinc-900 text-xs mb-1">Анықталу облысы (ОДЗ) және қасиеттер</h4>
                <div className="bg-white p-2.5 rounded-lg font-mono text-xs my-2 text-zinc-900 border border-zinc-200 space-y-1">
                  <div>• logₐ(x) анықталған ⇔ x &gt; 0, a &gt; 0, a ≠ 1</div>
                  <div>• logₐ(x · y) = logₐ(x) + logₐ(y) (x &gt; 0, y &gt; 0)</div>
                  <div>• logₐ(x / y) = logₐ(x) - logₐ(y)</div>
                  <div>• logₐ(xⁿ) = n · logₐ(x)</div>
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'trig' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div className="font-medium text-zinc-900 mb-1">Негізгі теңбе-теңдік</div>
                <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900">
                  sin²(α) + cos²(α) = 1
                </div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div className="font-medium text-zinc-900 mb-1">Қос бұрыш</div>
                <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900">
                  sin(2α) = 2 sin(α) cos(α)
                </div>
              </div>
            </div>
          )}

          {activeCategory === 'geom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div className="font-medium text-zinc-900 mb-1">Призма көлемі</div>
                <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900">
                  V = S_табан · H
                </div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                <div className="font-medium text-zinc-900 mb-1">Пирамида көлемі</div>
                <div className="font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-900">
                  V = ⅓ · S_табан · H
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 bg-zinc-50 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
}
