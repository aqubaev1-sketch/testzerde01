
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signUpUser } from "@/server/users";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Атыңызды енгізіңіз"),

  email: z
    .string()
    .min(1, "Электрондық поштаңызды енгізіңіз")
    .email("Электрондық пошта мекенжайын дұрыс енгізіңіз"),

  password: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы керек"),

  confirmPassword: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы керек"),
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (values.password !== values.confirmPassword) {
        toast.error("Құпиясөздер сәйкес келмейді");
        return;
      }

      const response = await signUpUser(
        values.email,
        values.password,
        values.name
      );

      if (response.success) {
        toast.success("Аккаунтыңызды растау үшін поштаңызды тексеріңіз.");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Қате орын алды. Қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  }

  const signUpWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/profile",
      });
    } catch (error) {
      console.error(error);
      toast.error("Google арқылы тіркелу мүмкін болмады");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className={`w-full max-w-md ${className ?? ""}`}
      {...props}
    >
      <div className="w-full">
        {/* Тақырып */}
        <div className="mb-8 text-center">
          <h1
            className="
              mb-2
              text-3xl
              font-bold
              uppercase
              tracking-tight
              text-[#1b1b1b]
              font-['Space_Grotesk',sans-serif]
            "
          >
            Тіркелу
          </h1>

          <p className="text-sm text-[#6a7282]">
            Аккаунт құрып, ҰБТ-ға дайындықты бастаңыз
          </p>
        </div>

        {/* Форма */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Аты */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Аты-жөні
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Иван Иванов"
                      autoComplete="name"
                      {...field}
                      className="
                        h-12
                        rounded-[4px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Электрондық пошта
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                      className="
                        h-12
                        rounded-[4px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Құпиясөз */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Құпиясөз
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      className="
                        h-12
                        rounded-[4px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Құпиясөзді растау */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      mb-2
                      block
                      text-[12px]
                      font-bold
                      uppercase
                      tracking-[1px]
                      text-[#6a7282]
                    "
                  >
                    Құпиясөзді растаңыз
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                      className="
                        h-12
                        rounded-[4px]
                        border-[#d1d5db]
                        bg-white
                        px-4
                        text-sm
                        text-[#1b1b1b]
                        shadow-none
                        outline-none
                        placeholder:text-[#9ca3af]
                        focus:border-[#1b1b1b]
                        focus:ring-0
                        transition-colors
                      "
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Тіркелу батырмасы */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="
                mt-1
                h-12
                w-full
                rounded-[4px]
                bg-[#6960C5]
                text-[14px]
                font-bold
                uppercase
                tracking-[1px]
                text-white
                shadow-none
                transition-colors
                hover:bg-[#5a51b3]
                active:bg-[#4e46a0]
                focus:ring-0
                disabled:opacity-50
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Құрылуда...
                </>
              ) : (
                "Тіркелу"
              )}
            </Button>
          </form>
        </Form>

        {/* Бөлгіш */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e5e7eb]" />

          <span
            className="
              text-[12px]
              uppercase
              tracking-[1px]
              text-[#6a7282]
            "
          >
            немесе
          </span>

          <div className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={signUpWithGoogle}
          disabled={isLoading || isGoogleLoading}
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-3
            rounded-[4px]
            border
            border-[#6960C5]
            bg-white
            text-[14px]
            font-bold
            uppercase
            tracking-[1px]
            text-[#1b1b1b]
            transition-colors
            hover:bg-[#6960C5]/5
            active:bg-[#6960C5]/10
            disabled:opacity-50
          "
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}

          {isGoogleLoading
            ? "Қосылуда..."
            : "Google арқылы тіркелу"}
        </button>

        {/* Кіру */}
        <p className="mt-8 text-center text-sm text-[#6a7282]">
          Аккаунтыңыз бар ма?{" "}
          <Link
            href="/login"
            className="
              font-bold
              text-[#1b1b1b]
              hover:underline
            "
          >
            Кіру
          </Link>
        </p>
      </div>
    </div>
  );
}

