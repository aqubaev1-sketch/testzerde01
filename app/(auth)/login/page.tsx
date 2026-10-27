import AuthPageTransition from "@/components/auth/AuthPageTransition";
import { LoginForm } from "@/components/forms/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const requestedCallbackUrl = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  return (
    <AuthPageTransition>
      {/* Передаём адрес возврата из proxy, чтобы после входа открыть нужную страницу. */}
      <LoginForm callbackUrl={requestedCallbackUrl} />
      </AuthPageTransition>
    
  );
  
}
