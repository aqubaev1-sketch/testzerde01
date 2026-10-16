
import AuthTabs from "@/components/auth/AuthTabs";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh w-full justify-center px-6 pb-10 pt-28 md:px-10 md:pt-32">
      <div className="w-full max-w-sm">
        {/* Кнопки остаются на одном месте */}
        <AuthTabs />

        {/* Форма входа или регистрации */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
