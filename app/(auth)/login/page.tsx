"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setToken } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onChange",
  });

  const { handleSubmit, control, formState } = form;

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      if (!res.ok) {
        setAuthError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      const { access_token } = await res.json();
      setToken(access_token);
      router.push("/dashboard");
    } catch {
      setIsLoading(false);
      setAuthError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand showcase ── */}
      <aside className="hidden lg:flex lg:w-[52%] surface-navy flex-col items-center justify-center p-14 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full border border-brand-gold/10 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full border border-brand-blue/20 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full border border-brand-gold/8 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-10 max-w-sm">
          <Image
            priority
            width={80}
            height={80}
            alt="Okapi Real Estate"
            src="/assets/images/company-logo.png"
            className="rounded-2xl shadow-lg"
          />

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Okapi Real Estate
            </h1>
            <p className="text-gold-gradient text-lg font-semibold">
              Admin Dashboard
            </p>
          </div>

          <p className="text-brand-gray/60 text-sm leading-relaxed">
            Manage agencies, agents, and properties from one centralized
            platform built for real estate professionals.
          </p>

          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { label: "Agencies", value: "24+" },
              { label: "Agents", value: "180+" },
              { label: "Properties", value: "1.2K+" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <span className="text-2xl font-bold text-brand-gold">
                  {value}
                </span>
                <span className="text-xs text-brand-gray/50 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right panel — login form ── */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center">
            <Image
              priority
              width={60}
              height={60}
              alt="Okapi Real Estate"
              src="/assets/images/company-logo.png"
              className="rounded-xl"
            />
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-3xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Global auth error */}
          {authError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {authError}
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              {/* Email */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@okapi.com"
                          autoComplete="email"
                          className="pl-9"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="pl-9 pr-10"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          id="rememberMe"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <Label
                        htmlFor="rememberMe"
                        className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
                      >
                        Keep me signed in
                      </Label>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm text-brand-blue hover:text-brand-blue/80"
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!formState.isValid || isLoading}
                className="w-full h-10 mt-1"
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Okapi Real Estate &copy; {new Date().getFullYear()}. All rights
            reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
