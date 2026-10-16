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
    <div className="space-y-16 pb-8 pt-0 font-sans sm:space-y-24 sm:pb-12 sm:pt-0">
      <style>{`
        .demo-step{opacity:0;transform:translateY(6px);animation:demoIn .5s ease-out forwards}
        @keyframes demoIn{to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.demo-step{animation:none;opacity:1;transform:none}}
      `}</style>

      
{/* ============================= HERO ============================= */}
<section className="relative isolate left-1/2 w-screen max-w-[2536px] -translate-x-1/2 overflow-hidden bg-white">
  {/* Full background: 2536 × 1724 */}
  <div className="relative mx-auto w-full max-w-[2536px] overflow-hidden">

    {/* Background grid */}
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e8ebf2 1px, transparent 1px),
          linear-gradient(to bottom, #e8ebf2 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage:
          "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
      }}
    />

    {/* Background gradient decorations */}
    <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-200/50 blur-[100px]" />

    <div className="pointer-events-none absolute -right-48 top-[300px] h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[120px]" />

    <div className="pointer-events-none absolute bottom-0 left-1/3 h-[450px] w-[650px] rounded-full bg-purple-100/50 blur-[120px]" />

    {/* Animated shapes */}
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {/* 1. Orange circle */}
      <div
        className="hero-motion-shape absolute left-[15%] top-[12%] h-11 w-11 rounded-full border-[6px] border-amber-400"
        style={{ animation: "heroPathOne 24s linear infinite" }}
      />

      {/* 2. Blue square */}
      <div
        className="hero-motion-shape absolute left-[8%] top-[30%] flex h-11 w-11 items-center justify-center rounded-xl border-[6px] border-blue-400"
        style={{ animation: "heroPathTwo 20s linear infinite" }}
      >
        <div className="h-3 w-3 rounded-full bg-blue-400" />
      </div>

      {/* 3. Purple square */}
      <div
        className="hero-motion-shape absolute right-[14%] top-[15%] flex h-11 w-11 items-center justify-center rounded-xl border-[6px] border-purple-400"
        style={{ animation: "heroPathThree 26s linear infinite" }}
      >
        <div className="h-3 w-3 rounded bg-purple-500" />
      </div>

      {/* 4. Mint square */}
      <div
        className="hero-motion-shape absolute left-[10%] top-[65%] h-10 w-10 rounded-lg border-[6px] border-emerald-400"
        style={{ animation: "heroPathThree 22s linear infinite reverse" }}
      />

      {/* 5. Small cyan circle */}
      <div
        className="hero-motion-shape absolute right-[22%] top-[34%] h-7 w-7 rounded-full bg-cyan-400"
        style={{ animation: "heroPathOne 18s linear infinite reverse" }}
      />

      {/* 6. Violet circle */}
      <div
        className="hero-motion-shape absolute right-[10%] bottom-[22%] h-12 w-12 rounded-full border-[7px] border-violet-300"
        style={{ animation: "heroPathTwo 28s linear infinite" }}
      />
    </div>

    {/* Animation keyframes */}
    <style>{`
      @keyframes heroPathOne {
        0%, 100% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(160px, 0);
        }
        50% {
          transform: translate(160px, 160px);
        }
        75% {
          transform: translate(0, 160px);
        }
      }

      @keyframes heroPathTwo {
        0%, 100% {
          transform: translate(0, 0);
        }
        20% {
          transform: translate(80px, 0);
        }
        40% {
          transform: translate(80px, -160px);
        }
        60% {
          transform: translate(240px, -160px);
        }
        80% {
          transform: translate(240px, 0);
        }
      }

      @keyframes heroPathThree {
        0%, 100% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(-160px, 0);
        }
        50% {
          transform: translate(-160px, 160px);
        }
        75% {
          transform: translate(0, 160px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-motion-shape {
          animation: none !important;
        }
      }
    `}</style>

    {/* Main content */}
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pb-10 pt-12 text-center sm:px-8 sm:pt-16 lg:pt-20">

      {/* Heading */}
      <h1 className="mt-8 max-w-5xl text-[clamp(2.6rem,5vw,5.8rem)] font-bold leading-[1.12] tracking-[-0.055em] text-[#1d2029] pt-14">
        ҰБТ-ға дайындықтың{" "}
        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
          дербес AI-агенті
        </span>
      </h1>

      {/* Description */}
      
      <p className="mt-6 max-w-4xl text-base leading-[1.25] text-slate-500 sm:text-xl lg:text-2xl">
        Қазақ ұлттық қыздар педагогикалық университетінің
        студенттері жасаған AI негізіндегі ақылды оқу платформасы.
        AI-репетитор есептерді қадамдап түсіндіріп,
        оқу нәтижелеріңізді талдайды.
      </p>


      
{/* Buttons */}
<div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">

  {/* Primary Button */}
  <Link
    href="/testent"
    className="group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-indigo-500 px-6 font-['Inter',sans-serif] text-[14px] font-bold uppercase tracking-[1px] text-white transition-opacity hover:opacity-90 sm:w-auto"
  >
    ҰБТ тест тапсыру
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </Link>

  {/* AI Tutor Button */}
  <button
    type="button"
    onClick={() => setShowTutor(true)}
    className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[15px] border border-slate-200 bg-white px-6 font-['Inter',sans-serif] text-[14px] font-bold uppercase tracking-[1px] text-slate-800 transition-all hover:border-indigo-300 hover:bg-indigo-50 sm:w-auto"
  >
    <Brain className="h-4 w-4 text-indigo-600" />
    Репетитормен сөйлесу
  </button>

  

</div>


      {/* Feature chips */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {[
          "140 баллдық жаңа тест базасы",
          "Қателерді AI арқылы талдау",
          "QYZPU гранттар калькуляторы",
        ].map((text) => (
          <div
            key={text}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            {text}
          </div>
        ))}
      </div>
    </div>

    {/* Bottom soft fade */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/70 to-transparent" />
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white">
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

      {/* ============================= QYZPU =============================
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
      </section> */}

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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
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