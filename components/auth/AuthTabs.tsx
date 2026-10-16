
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AuthTabs() {
  const pathname = usePathname();
  const active = pathname === "/signup" ? "signup" : "login";

  return (
    <div className="relative mb-8 grid h-[56px] grid-cols-2 rounded-[15px] bg-slate-100 p-1.5">
      <motion.div
        className="absolute bottom-1.5 top-1.5 left-1.5 w-[calc((100%-12px)/2)] rounded-[12px] bg-indigo-500 shadow-sm"
        animate={{ x: active === "signup" ? "100%" : "0%" }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
        }}
      />

      <Link
        href="/login"
        className={`relative z-10 flex items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-[1px] transition-colors ${
          active === "login" ? "text-white" : "text-slate-500"
        }`}
      >
        Кіру
      </Link>

      <Link
        href="/signup"
        className={`relative z-10 flex items-center justify-center rounded-[12px] text-sm font-bold uppercase tracking-[1px] transition-colors ${
          active === "signup" ? "text-white" : "text-slate-500"
        }`}
      >
        Тіркелу
      </Link>
    </div>
  );
}
