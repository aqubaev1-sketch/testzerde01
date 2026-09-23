"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов"),

  confirmPassword: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов"),
});

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (values.password !== values.confirmPassword) {
        toast.error("Пароли не совпадают");
        return;
      }

      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token ?? "",
      });

      if (!error) {
        toast.success("Пароль успешно изменён");
        router.push("/login");
      } else {
        toast.error(error.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`w-full max-w-md ${className ?? ""}`}
      {...props}
    >
      <div className="w-full">
        {/* Заголовок */}
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
            Новый пароль
          </h1>

          <p className="text-sm text-[#6a7282]">
            Придумайте новый пароль для входа в аккаунт
          </p>
        </div>

        {/* Форма */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Пароль */}
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
                    Новый пароль
                  </FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                        className="
                          h-12
                          rounded-[4px]
                          border-[#d1d5db]
                          bg-white
                          px-4
                          pr-11
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

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6a7282]
                          transition-colors
                          hover:text-[#1b1b1b]
                        "
                        aria-label={
                          showPassword
                            ? "Скрыть пароль"
                            : "Показать пароль"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Подтверждение пароля */}
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
                    Подтвердите пароль
                  </FormLabel>

                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...field}
                        className="
                          h-12
                          rounded-[4px]
                          border-[#d1d5db]
                          bg-white
                          px-4
                          pr-11
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

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirm((prev) => !prev)
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[#6a7282]
                          transition-colors
                          hover:text-[#1b1b1b]
                        "
                        aria-label={
                          showConfirm
                            ? "Скрыть пароль"
                            : "Показать пароль"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Кнопка */}
            <Button
              type="submit"
              disabled={isLoading}
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
                  Сохраняем...
                </>
              ) : (
                "Сохранить пароль"
              )}
            </Button>
          </form>
        </Form>

        {/* Ссылка назад на вход */}
        <div className="mt-8 text-center text-sm text-[#6a7282]">
          <Link
            href="/login"
            className="
              inline-flex
              items-center
              gap-1.5
              font-bold
              text-[#1b1b1b]
              transition-colors
              hover:text-[#6960C5]
            "
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Вернуться ко входу
          </Link>
        </div>
      </div>
    </div>
  );
}