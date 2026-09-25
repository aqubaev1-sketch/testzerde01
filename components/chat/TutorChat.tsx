'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WEBHOOK_URL = 'https://superfbfb.app.n8n.cloud/webhook/626b7d2f-9e6e-4401-8295-a75bf7f521e3';

export default function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // sessionId: берём из localStorage, если есть — иначе создаём и сохраняем
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'ssr';
    let id = localStorage.getItem('tutor_session');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('tutor_session', id);
    }
    return id;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: input,
          sessionId,
          history: updated,
        }),
      });

      const raw = await res.text();

      if (!raw) {
        // Пустой ответ — n8n ничего не вернул
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Жауап келмеді (webhook пустой).' },
        ]);
        return;
      }

      let reply = raw;
      try {
        const data = JSON.parse(raw);
        reply =
          data.output ||
          data.text ||
          data.message ||
          (Array.isArray(data) ? data[0]?.output : '') ||
          raw;
      } catch {
        // не JSON — показываем как есть
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Желі қатесі: ' + e.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Заголовок панели */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-gray-900">AI-репетитор</span>
          <span className="text-[11px] text-gray-400">v2.4</span>
        </div>
        <span className="text-[11px] text-gray-400">
          Сәлеметсің бе? Қандай пәннен бастаймыз?
        </span>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 pt-8">
            Сәлем! Мен ZERDE AI. Қандай пәнді талқылаймыз?
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500">
              ZERDE AI ойланып жатыр...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Быстрые действия */}
      <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-gray-100">
        {['ОДЗ қарастыру', 'Формулалар', 'Қадамдық талдау'].map((chip) => (
          <button
            key={chip}
            onClick={() => setInput(chip)}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Ввод */}
      <div className="p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Сұрағыңызды немесе формуланы жазыңыз..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
        >
          {loading ? '...' : 'Жіберу'}
        </button>
      </div>
    </div>
  );
}