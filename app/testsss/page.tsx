'use client';

import { useState, useEffect, useCallback } from 'react';
// Убрали MessageCircle, так как он больше не нужен
import { X, Sparkles, Bot, ShieldCheck } from 'lucide-react';
import Testai from '@/components/chat/Testai';
import TutorChat from '@/components/chat/TutorChat';

export default function TestPage() {
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setChatOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (chatOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [chatOpen]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50/60 selection:bg-indigo-500 selection:text-white relative font-sans antialiased">
      {/* Фоновый декор */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      </div>

      {/* Основной контент */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex justify-center">
        <div className="relative w-full max-w-4xl min-w-0 break-words">
          <Testai />
        </div>
      </div>

      {/* Кнопка AI — fixed, всегда в пределах экрана и поверх затемнения */}
      <button
        onClick={() => setChatOpen((prev) => !prev)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-2xl text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
          chatOpen
            ? 'rotate-90 bg-indigo-700'
            : 'rotate-0 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600'
        }`}
        aria-label={chatOpen ? 'Чатты жабу' : 'Чатты ашу'}
        aria-expanded={chatOpen}
      >
        <span className="relative flex items-center justify-center">
          {chatOpen ? (
            <X className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <>
              {/* Заменили иконку на текст AI */}
              <span className="font-bold text-xl tracking-wider">AI</span>
              
              {/* Оставили пульсирующий бэйдж уведомления */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-indigo-600" />
              </span>
            </>
          )}
        </span>
      </button>

      {/* Floating Modal Chat Widget */}
      <aside
        aria-label="AI Assistant Chat"
        className={`fixed z-50 transition-all duration-300 ease-out origin-bottom-right
          left-3 right-3 top-3 bottom-24
          sm:left-auto sm:top-auto sm:right-6 sm:bottom-24
          sm:w-[420px] sm:max-w-[calc(100vw-3rem)]
          sm:h-[620px] sm:max-h-[calc(100dvh-7.5rem)]
          ${
            chatOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
          }`}
      >
        <div className="w-full h-full min-w-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col ring-1 ring-black/5">
          <header className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between gap-3 shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-600 rounded-full shadow-sm" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="font-semibold text-sm tracking-tight text-white truncate">
                    ZERDE AI 
                  </h2>
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300 fill-amber-300 animate-pulse" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setChatOpen(false)}
              className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Закрыть чат"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-slate-50/50 relative overflow-hidden break-words">
            <TutorChat />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300"
          onClick={() => setChatOpen(false)}
          aria-hidden="true"
        />
      )}
    </main>
  );
}