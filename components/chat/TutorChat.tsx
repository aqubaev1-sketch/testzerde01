'use client';

import { memo, useState, useRef, useEffect } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Bot, SendHorizontal } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WEBHOOK_URL = 'https://superfbfb.app.n8n.cloud/webhook/626b7d2f-9e6e-4401-8295-a75bf7f521e3';

/* =========================================================
   Модели часто пишут формулы как \( ... \) и \[ ... \],
   а remark-math понимает только $...$ и $$...$$.
   Приводим всё к одному виду.
========================================================= */
function normalizeMath(src: string) {
  return src
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m: string) => `\n$$\n${m.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m: string) => `$${m.trim()}$`);
}

const mdComponents: Components = {
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  h1: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-bold">{children}</h4>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    return isBlock ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-gray-200/70 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 max-w-full overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-2 max-w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-200 px-2 py-1">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-indigo-200 pl-3 text-gray-600">{children}</blockquote>
  ),
};

// memo: чтобы формулы не перерисовывались при каждом нажатии клавиши в поле ввода
const MessageContent = memo(function MessageContent({ text }: { text: string }) {
  return (
    <div className="chat-md min-w-0 [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={mdComponents}
      >
        {normalizeMath(text)}
      </ReactMarkdown>
    </div>
  );
});

export default function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // localStorage читаем в useEffect, иначе будет ошибка гидратации в Next.js
  useEffect(() => {
    let id = localStorage.getItem('tutor_session');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('tutor_session', id);
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;

    const userMsg: Message = { role: 'user', content: value };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: value,
          sessionId: sessionId || 'anonymous',
          history: updated,
        }),
      });

      const raw = await res.text();

      if (!raw) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Жауап келмеді (webhook бос).' }]);
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

      setMessages((prev) => [...prev, { role: 'assistant', content: String(reply) }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Желі қатесі: ' + msg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <style>{`
        .chat-md .katex{font-size:1.05em}
        .chat-md .katex-display{margin:.6em 0;overflow-x:auto;overflow-y:hidden;padding:.25em 0;max-width:100%}
        .chat-md .katex-display>.katex{white-space:nowrap}
        @keyframes chatShimmer{to{transform:translateX(100%)}}
        @media (prefers-reduced-motion:reduce){.chat-shimmer{animation:none!important}}
      `}</style>

      {/* Сообщения */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-gray-400">
            Сәлем! Мен ZERDE AI. Қандай пәнді талқылаймыз?
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'whitespace-pre-wrap bg-indigo-600 text-white [overflow-wrap:anywhere]'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {m.role === 'user' ? m.content : <MessageContent text={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-start gap-2.5 py-1" role="status" aria-live="polite">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200/50 bg-emerald-50 text-emerald-600">
              <Bot className="h-4 w-4 animate-bounce" />
            </div>
            <div className="relative overflow-hidden rounded-full border border-gray-100 bg-gray-50 px-4 py-1.5">
              <div
                className="chat-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-100/60 to-transparent"
                style={{ animation: 'chatShimmer 1.5s infinite' }}
              />
              <span className="relative text-xs font-medium text-gray-600">AI ойланып жатыр...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Быстрые действия */}
      <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-4 pb-1 pt-2">
        {['ОДЗ қарастыру', 'Формулалар', 'Қадамдық талдау'].map((chip) => (
          <button
            key={chip}
            onClick={() => setInput(chip)}
            className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Ввод */}
      <div className="flex gap-2 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && send()}
          placeholder="Сұрағыңызды жазыңыз..."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Жіберу"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          <span className="hidden sm:inline">Жіберу</span>
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}