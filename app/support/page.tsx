// app/support/page.tsx
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import SupportForm from './SupportForm';

export const metadata = {
  title: 'Қолдау және кері байланыс | ZERDE',
};

const FAQ = [
  {
    q: 'Тест нәтижемді қайдан көремін?',
    a: 'Профиль бетінде тест тарихы мен нәтиже динамикасы бар.',
  },
  {
    q: 'Тест кезінде интернет үзілсе не болады?',
    a: 'Әр таңдаған жауабыңыз серверге сақталады. Бетті қайта ашсаңыз, тест сол жерден жалғасады.',
  },
  {
    q: 'AI репетитор қате жауап берсе?',
    a: 'Формадан «AI репетитор» тақырыбын таңдап, сұрағыңызды жіберіңіз — біз тексереміз.',
  },
];

export default async function SupportPage() {
  // Қолданушы кірген болса, аты мен email өздігінен толады
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 font-sans text-slate-800 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Қолдау және кері байланыс
          </h1>
          <p className="mt-2 text-slate-600">
            Қате тапсаңыз немесе ұсынысыңыз болса, жазыңыз. Әдетте жұмыс күндері жауап береміз.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section aria-label="Жиі қойылатын сұрақтар" className="min-w-0 space-y-3">
            <h2 className="text-base font-bold text-slate-900">Жиі қойылатын сұрақтар</h2>
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </section>

          <SupportForm
            defaultName={session?.user?.name ?? ''}
            defaultEmail={session?.user?.email ?? ''}
          />
        </div>
      </div>
    </div>
  );
}