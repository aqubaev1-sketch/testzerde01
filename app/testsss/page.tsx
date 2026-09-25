'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Testai from '@/components/chat/Testai';
import TutorChat from '@/components/chat/TutorChat';

export default function TestPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFC]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Тест теперь один на всю ширину */}
        <div className="max-w-3xl mx-auto">
          <Testai />
        </div>
      </div>

      {/* Кнопка-переключатель чата */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label={chatOpen ? 'Чатты жабу' : 'Чатты ашу'}
      >
        {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Панель чата — выезжает справа */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-40 transition-transform duration-300 ease-in-out ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full p-4 pt-20">
          <TutorChat />
        </div>
      </div>

      {/* Затемнение фона при открытом чате (опционально, удобно на мобильных) */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 sm:hidden"
          onClick={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}