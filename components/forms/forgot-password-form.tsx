
"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
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

import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Электрондық поштаңызды енгізіңіз")
    .email("Электрондық пошта мекенжайын дұрыс енгізіңіз"),
});

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (!error) {
        toast.success(
          "Поштаңызды тексеріңіз — құпиясөзді қалпына келтіру сілтемесін жібердік."
        );
      } else {
        toast.error(error.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Қате орын алды. Қайталап көріңіз.");
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
            Құпиясөзді ұмыттыңыз ба?
          </h1>

          <p className="text-sm text-[#6a7282]">
            Поштаңызды енгізіңіз — құпиясөзді қалпына келтіру сілтемесін жібереміз
          </p>
        </div>

        {/* Форма */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
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

            {/* Батырма */}
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
                  Жіберілуде...
                </>
              ) : (
                "Құпиясөзді қалпына келтіру"
              )}
            </Button>
          </form>
        </Form>

        {/* Кіру бетіне қайта оралу */}
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
            Кіру бетіне оралу
          </Link>
        </div>
      </div>
    </div>
  );
}

