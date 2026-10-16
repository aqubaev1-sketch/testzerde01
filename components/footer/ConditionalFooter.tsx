
"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Страницы, на которых Footer скрыт
  const hiddenRoutes = [
    "/",
  ];

  const shouldHide = hiddenRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (shouldHide) return null;

  return <Footer />;
}
