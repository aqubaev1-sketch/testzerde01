import AuthPageTransition from "@/components/auth/AuthPageTransition";
import { LoginForm } from "@/components/forms/login-form";

export default function Page() {
  return (
    <AuthPageTransition>
      <LoginForm />
      </AuthPageTransition>
    
  );
  
}