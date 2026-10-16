
import Link from "next/link";
import {
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import {
  ArrowRight,
  Brain,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

export default function FooterHome() {
  return (
    <footer className="w-full bg-white px-3 pb-3 pt-8 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[2520px] overflow-hidden rounded-[28px] bg-indigo-500 text-white sm:rounded-[26px]">

        {/* ================= CTA ================= */}
        <div className="flex flex-col items-center px-6 pb-16 pt-16 text-center sm:pt-20 lg:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-purple-100">
            <GraduationCap className="h-4 w-4" />
            ZERDE AI · Ақылды білім беру
          </div>

          <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
            ҰБТ-ға дайындықты бүгін бастаңыз.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#E3D9FF] sm:text-lg">
            AI-репетитор көмегімен есептерді қадамдап үйреніп,
            біліміңізді тексеріңіз және нәтижелеріңізді талдаңыз.
          </p>

          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/testsss"
              className="group inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-white px-6 text-sm font-bold text-[#34205C] transition-all hover:bg-purple-50 sm:w-auto"
            >
              <Brain className="h-4 w-4" />
              AI репетитор
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/testent"
              className="group inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] border border-white/15 bg-[#8055D7] px-6 text-sm font-bold text-white transition-all hover:bg-[#9067E5] sm:w-auto"
            >
              Тест тапсыру
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/20 sm:mx-12 lg:mx-20" />

        {/* ================= MAIN FOOTER ================= */}
        <div className="grid gap-12 px-6 py-14 sm:px-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:px-20">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className={`${fredoka.className} inline-flex items-center text-[#ffffff] text-[32px] font-bold tracking-tight no-underline pr-8`}
            >
              ZERDE
              
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-[1.8] text-[#E3D9FF]">
              Қазақ ұлттық қыздар педагогикалық университетінің
              студенттері жасаған AI негізіндегі ақылды оқу
              платформасы.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[1px] text-white">
              Платформа
            </h3>

            <ul className="space-y-4">
              {[
                { label: "Басты бет", href: "/" },
                { label: "AI репетитор", href: "/testsss" },
                { label: "ҰБТ тренажері", href: "/testent" },
                { label: "Жеке кабинет", href: "/profile" },
                { label: "Қолдау қызметі", href: "/support" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#E3D9FF] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[1px] text-white">
              Байланыс
            </h3>

            <div className="space-y-4">
              <a
                href="mailto:info@qyzpu.edu.kz"
                className="flex items-center gap-3 text-sm text-[#E3D9FF] transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                info@qyzpu.edu.kz
              </a>

              <a
                href="tel:+77272370095"
                className="flex items-center gap-3 text-sm text-[#E3D9FF] transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +7 (727) 237-00-95
              </a>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaInstagram size={18} />
                </Link>

                <Link
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaTelegramPlane size={18} />
                </Link>

                <Link
                  href="https://wa.me/77471401404"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  <FaWhatsapp size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mx-6 h-px bg-white/20 sm:mx-12 lg:mx-20" />

        <div className="flex flex-col items-center justify-between gap-4 px-6 py-7 sm:px-12 md:flex-row lg:px-20">
          <p className="text-center text-xs text-[#D6C7F7]">
            © 2026 Zerde Educational Systems. Барлық құқықтар қорғалған.
          </p>

          
        </div>
      </div>
    </footer>
  );
}
