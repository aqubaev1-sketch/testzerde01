'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  GraduationCap,
  Timer,
  X,
} from 'lucide-react';
import TutorChat from '@/components/chat/TutorChat';

const STATS = [
  { num: '140', label: 'максималды балл' },
  { num: '85,2%', label: 'грант көрсеткіші' },
  { num: '2 000+', label: 'типтік сұрақ' },
  { num: '24/7', label: 'AI-репетитор онлайн' },
];

const DEMO_STEPS = [
  { title: '1. Коэффициенттерді табамыз', body: 'a = 1,  b = −5,  c = 6' },
  { title: '2. Дискриминант', body: 'D = b² − 4ac = 25 − 24 = 1' },
  { title: '3. Түбірлер', body: 'x₁ = (5 − 1) / 2 = 2,   x₂ = (5 + 1) / 2 = 3' },
];

export function LandingHero() {
  const [showTutor, setShowTutor] = useState(false);

  useEffect(() => {
    if (!showTutor) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowTutor(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showTutor]);

  return (
    <div className="space-y-16 py-8 font-sans sm:space-y-24 sm:py-12">
      <style>{`
        .demo-step{opacity:0;transform:translateY(6px);animation:demoIn .5s ease-out forwards}
        @keyframes demoIn{to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.demo-step{animation:none;opacity:1;transform:none}}
      `}</style>

      {/* ============================= HERO ============================= */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="min-w-0">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            ҰБТ-ға дайындықтың дербес AI-агенті
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Қазақ ұлттық қыздар педагогикалық университетінің ғалымдары мен AI инженерлері жасаған
            оқу ортасы. Дайын жауап емес, шешудің қадамдарын түсіндіретін репетитор және жеке
            кабинетте нәтижеңіздің талдауы.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/testent"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 sm:text-base"
            >
              ҰБТ тест тапсыру
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => setShowTutor(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-50/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 sm:text-base"
            >
              <Brain className="h-4 w-4 text-indigo-600" />
              Репетитормен сөйлесу
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-2 py-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-700 sm:text-base"
            >
              <BarChart3 className="h-4 w-4" />
              Жеке кабинет
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
            {[
              '140 баллдық жаңа тест базасы',
              'Қателерді AI арқылы талдау',
              'QYZPU гранттар калькуляторы',
            ].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Демонстрация репетитора: шешім қадамдары бірінен соң бірі шығады */}
        <div
          className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          role="img"
          aria-label="ZERDE AI репетиторының диалог үлгісі: квадрат теңдеуді қадамдап шешу"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">ZERDE AI Репетитор</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                онлайн
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50/70 p-5" aria-hidden="true">
            <div className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white">
                x² − 5x + 6 = 0 теңдеуін қалай шешемін?
              </p>
            </div>

            <div className="max-w-[92%] space-y-2 rounded-2xl rounded-bl-md bg-white p-4 text-sm text-slate-800 shadow-sm ring-1 ring-slate-100">
              <p className="demo-step" style={{ animationDelay: '0.3s' }}>
                Бұл квадрат теңдеу. Дискриминант арқылы шығарамыз:
              </p>
              {DEMO_STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="demo-step rounded-xl bg-slate-50 px-3 py-2"
                  style={{ animationDelay: `${0.9 + i * 0.8}s` }}
                >
                  <p className="text-xs font-semibold text-indigo-700">{s.title}</p>
                  <p className="mt-0.5 [overflow-wrap:anywhere] font-medium tabular-nums">{s.body}</p>
                </div>
              ))}
              <p
                className="demo-step font-semibold text-emerald-700"
                style={{ animationDelay: `${0.9 + DEMO_STEPS.length * 0.8}s` }}
              >
                Жауабы: x = 2 және x = 3
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= STATS ============================= */}
      <section
        aria-label="Платформа көрсеткіштері"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 md:grid-cols-4"
      >
        {STATS.map((s) => (
          <div key={s.label} className="bg-white p-5 sm:p-7">
            <p className="text-3xl font-bold tabular-nums tracking-tight text-indigo-600 sm:text-4xl">
              {s.num}
            </p>
            <p className="mt-1.5 text-sm text-slate-600">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ============================= FEATURES ============================= */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Дайындыққа қажеттінің бәрі бір жерде
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Қазақ ұлттық қыздар педагогикалық университетінің инновациялық әдістемесі.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {/* Репетитор — үлкен карточка */}
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 md:col-span-4">
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ZERDE AI-репетитор</h3>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                Сұрақты қазақ немесе орыс тілінде қойыңыз. AI дайын жауапты емес, шешудің қадамдық
                логикасын, формулалары мен ережелерін түсіндіреді.
              </p>
            </div>
            <button
              onClick={() => setShowTutor(true)}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Репетиторды сынап көру
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <FeatureLink
            href="/testent"
            icon={<Timer className="h-5 w-5" />}
            title="ҰБТ тренажері"
            text="Нақты емтихан шарттары: пәндер комбинациясы, таймер, лезде балл есептеу және әр қатеге AI талдауы."
            cta="Тест тапсыру"
            className="md:col-span-2"
          />

          <FeatureLink
            href="/profile"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Жеке кабинет"
            text="Нәтиже динамикасы, тест тарихы және осал тақырыптарды анықтау."
            cta="Кабинетке өту"
            className="md:col-span-2"
          />

          <FeatureLink
            href="/qyzpu"
            icon={<GraduationCap className="h-5 w-5" />}
            title="QYZPU гранттар калькуляторы"
            text="2025/2026 оқу жылының грант шекті баллдары, шәкіртақы мөлшері және мамандықтар каталогы."
            cta="QYZPU мамандықтары"
            className="md:col-span-4"
          />
        </div>
      </section>

      {/* ============================= QYZPU ============================= */}
      <section className="rounded-3xl bg-indigo-950 p-8 text-white sm:p-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">
              Болашақ педагогтар мен STEM мамандарының ордасы
            </h2>
            <p className="text-sm leading-relaxed text-indigo-200 sm:text-base">
              80 жылдық тарихы бар ұлттық университет ҰБТ-да жоғары балл жинаған талапкерлерге
              мемлекеттік грант, президенттік шәкіртақы (45 000+ ₸), жайлы жатақхана және
              шетелдік тағылымдама ұсынады.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:flex-col lg:flex-row">
            <Link
              href="/qyzpu"
              className="whitespace-nowrap rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
            >
              Гранттарды қарау
            </Link>
            <Link
              href="/testent"
              className="whitespace-nowrap rounded-xl border border-indigo-700 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-900"
            >
              Тест тапсыру
            </Link>
          </div>
        </div>
      </section>

      {/* ============================= ТЬЮТОР МОДАЛКАСЫ ============================= */}
      {showTutor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4"
          onClick={() => setShowTutor(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ZERDE AI репетиторы"
            className="flex h-[min(680px,calc(100dvh-2rem))] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <p className="truncate text-sm font-semibold text-slate-900">ZERDE AI Репетитор</p>
              </div>
              <button
                onClick={() => setShowTutor(false)}
                aria-label="Жабу"
                className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <TutorChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureLink({
  href,
  icon,
  title,
  text,
  cta,
  className = '',
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 sm:p-8 ${className}`}
    >
      <div className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{text}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}