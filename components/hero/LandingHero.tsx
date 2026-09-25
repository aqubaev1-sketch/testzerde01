'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  GraduationCap,
  BarChart3,
  Target,
  BookOpenCheck,
} from 'lucide-react';
import TutorChat from '@/components/chat/TutorChat';

export function LandingHero() {
  const router = useRouter();
  const [showTutor, setShowTutor] = useState(false);

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">

      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 sm:p-12 md:p-16 shadow-xs">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>QYZPU УНИВЕРСИТЕТІНІҢ РЕСМИ AI ПЛАТФОРМАСЫ</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] font-sans">
            ҰБТ-ға дайындықтың  <br className="hidden sm:inline" />
            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
              дербес AI-агенті
            </span>{' '}
            
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Қазақ ұлттық қыздар педагогикалық университетінің ғалымдары мен AI
            инжинирингі біріккен цифрлық орта. Дербес оқыту, 24/7 AI-репетитор
            және жеке кабинеттегі терең аналитика.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => router.push('/testent')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              <span>ҰБТ тест тапсыру</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowTutor(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>ZERDE AI Репетитормен сөйлесу</span>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-indigo-50/50 border border-indigo-200 text-indigo-900 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Жеке кабинет</span>
            </button>
          </div>

          {/* Feature highlights bullets */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 font-medium border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>140 баллдық жаңа тест базасы</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Қателіктерді ИИ арқылы талдау</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>QYZPU Грант калькуляторы</span>
            </div>
          </div>

        </div>
      </section>

      {/* Metric Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            num: '140',
            unit: 'макс. балл',
            label: 'Максималды нәтиже мақсаты',
            icon: Target,
          },
          {
            num: '94.2%',
            unit: 'грант',
            label: 'QYZPU және мемлекеттік грант көрсеткіші',
            icon: GraduationCap,
          },
          {
            num: '12,000+',
            unit: 'сұрақ',
            label: 'ҰБТ 2025/2026 типтік сұрақтар базасы',
            icon: BookOpenCheck,
          },
          {
            num: '24/7',
            unit: 'онлайн',
            label: 'ZERDE AI дербес оқыту репетиторы',
            icon: Brain,
          },
        ].map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-gray-400 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {stat.unit}
                </span>
                <IconComponent className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl sm:text-4xl font-extrabold text-indigo-600 font-mono tracking-tight">
                  {stat.num}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4 Pillars of ZERDE Platform */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            ZERDE платформасының 4 негізгі артықшылығы
          </h2>
          <p className="text-sm text-gray-500">
            Қазақ ұлттық қыздар педагогикалық университетінің инновациялық әдістемесі
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 hover:border-indigo-200 transition-all space-y-4 relative overflow-hidden shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              ZERDE AI-Репетитор және дербес оқыту
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Пән бойынша туындаған кез келген күрделі сұрақты қазақ немесе
              орыс тілінде қойыңыз. ИИ сұрақтың дайын жауабын емес, оны
              шешудің қадамдық логикасын, формулалары мен ережелерін
              түсіндіреді.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowTutor(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Репетиторды сынап көру</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 hover:border-indigo-200 transition-all space-y-4 relative overflow-hidden shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              ҰБТ Экспресс Тренажер және таймер
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Нақты ҰБТ емтиханының шарттары: міндетті және бейіндік пәндер
              комбинациясы, уақыт бақылауы, лезде балл есептеу және әрбір
              қатеге ИИ арқылы жасалған егжей-тегжейлі талдау.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/testEnt')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Тест тапсыру</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 hover:border-indigo-200 transition-all space-y-4 relative overflow-hidden shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              Жеке кабинет және пән радары
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Интерактивті дайындық кабинеті: оқушының әр пән бойынша меңгеру
              деңгейінің радары, осал тақырыптар диагностикасы (Weak Spot
              Generator) және апталық оқу кестесі.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/cabinet')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Кабинетке өту</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 hover:border-indigo-200 transition-all space-y-4 relative overflow-hidden shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              QYZPU Гранттар калькуляторы
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Қазақ ұлттық қыздар педагогикалық университетінің институттары,
              2025/2026 оқу жылының грант шекті баллдары, шәкіртақы мөлшері
              және мамандықтар каталогы.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push('/qyzpu')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>QYZPU мамандықтары</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* QYZPU University Endorsement Banner */}
      <section className="bg-indigo-900 rounded-xl p-8 sm:p-12 text-white relative overflow-hidden shadow-sm">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white opacity-5 rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/20 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              <span>QYZPU — 80 ЖЫЛДЫҚ ТАРИХЫ БАР ҰЛТТЫҚ ФЛАГМАН</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans">
              Болашақ педагогтар мен STEM мамандарының ордасы
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              QYZPU университеті ҰБТ-да жоғары балл жинаған талапкерлерге
              мемлекеттік грант, президенттік шәкіртақы (45,000+ ₸), жайлы
              жатақхана және шетелдік тағылымдама ұсынады.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => router.push('/qyzpu')}
              className="px-6 py-3.5 rounded-xl bg-white text-indigo-900 hover:bg-gray-100 font-bold text-sm transition-all text-center whitespace-nowrap shadow-sm"
            >
              QYZPU Гранттарын қарау
            </button>
            <button
              onClick={() => router.push('/testEnt')}
              className="px-6 py-3.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold text-sm transition-all border border-indigo-700/80 text-center whitespace-nowrap"
            >
              Тест тапсыру
            </button>
          </div>
        </div>
      </section>

      {/* ===== МОДАЛКА AI-ТЬЮТОРА ===== */}
      {showTutor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowTutor(false)}
        >
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-sm">
                ZERDE AI • Репетитор
              </span>
              <button
                onClick={() => setShowTutor(false)}
                className="text-white hover:text-gray-300 font-bold text-sm"
              >
                ✕ Жабу
              </button>
            </div>
            <TutorChat />
          </div>
        </div>
      )}

    </div>
  );
}