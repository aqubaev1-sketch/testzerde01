// app/support/SupportForm.tsx
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { sendSupportMessage, type SupportState } from './actions';


const initialState: SupportState = { ok: false, message: '' };

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

export default function SupportForm({
  defaultName = '',
  defaultEmail = '',
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState(sendSupportMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [length, setLength] = useState(0);

  // Сәтті жіберілгеннен кейін тек хабарлама өрісін тазалаймыз
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setLength(0);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Аты-жөніңіз
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            defaultValue={defaultName}
            placeholder="Айгерім"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            defaultValue={defaultEmail}
            placeholder="name@mail.ru"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-slate-700">
          Тақырып
        </label>
        <select id="topic" name="topic" defaultValue="bug" className={inputCls}>
          <option value="bug">Қате туралы хабарлама</option>
          <option value="test">Тест / нәтиже мәселесі</option>
          <option value="ai">AI репетитор</option>
          <option value="idea">Ұсыныс</option>
          <option value="other">Басқа</option>
        </select>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="message" className="text-sm font-medium text-slate-700">
            Хабарлама
          </label>
          <span className="text-xs tabular-nums text-slate-400">{length} / 3000</span>
        </div>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          onChange={(e) => setLength(e.target.value.length)}
          placeholder="Не болды? Қай бетте? Мүмкін болса, қадамдарын жазыңыз."
          className={`${inputCls} resize-y`}
        />
      </div>

      {/* Honeypot: адамға көрінбейді, ботты ұстайды */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Веб-сайт
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        <Send className="h-4 w-4" />
        {pending ? 'Жіберілуде...' : 'Жіберу'}
      </button>

      {state.message && (
        <p
          role={state.ok ? 'status' : 'alert'}
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            state.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      )}
    </form>
  );
}