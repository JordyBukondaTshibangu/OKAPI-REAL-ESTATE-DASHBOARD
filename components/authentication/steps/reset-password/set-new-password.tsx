"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

import Loading from "@/components/feedback/molecules/loading";
import DialogInfo from "@/components/tenant/common/info";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { resetPassword } from "@/store/features/admin/auth/slice";
import { ApiError } from "@/types/error";
import { passwordRequirements } from "@/utils/password-requirements";

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    passwordConfirmation: z.string().min(8, {
      message: "Password doesn’t match",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Password doesn’t match",
    path: ["passwordConfirmation"],
  });

const { SESSION_EXPIRED } = ONBOARDING_STATE_CODES;

function SetPassword() {
  const { moveToNextStep } = useMultiStepContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { watch, handleSubmit, control } = form;

  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false);

  const passwordValue = watch("password");
  const passwordConfirmationValue = watch("passwordConfirmation");

  const dispatch = useDispatch<AppDispatch>();

  const session = localStorage.getItem("session");

  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(passwordValue || ""),
  );

  const passwordsMatch =
    passwordValue &&
    passwordConfirmationValue &&
    passwordValue === passwordConfirmationValue;

  const isFormValid = allRequirementsMet && passwordsMatch;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // setLoading(true);

    const { password, passwordConfirmation } = values;

    if (!session || !password || !passwordConfirmation) return;

    try {
      const response = await dispatch(
        resetPassword({
          password,
          passwordConfirmation,
          session: session!,
        }),
      ).unwrap();

      if (response) {
        moveToNextStep();
      }

      toast.success("Password has been reset.");

      setLoading(false);

      form.reset();
    } catch (err) {
      setLoading(false);
      console.error("Password Reset failed:", err);

      const apiError = err as ApiError;

      if (apiError.errorCode === SESSION_EXPIRED.code) {
        setShowDialog(true);
      }

      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-muted">
      {loading ? <Loading label="Resetting Password" /> : null}

      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}

      <div className="relative mx-auto flex flex-col items-center justify-between w-full max-w-140 min-h-138.5 max-h-150 rounded-lg border border-t-0 bg-card p-12 gap-14 shadow-md">
        <div className="flex flex-col w-full gap-10">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <Image
              src="/images/ztna-logo.png"
              width={36}
              height={36}
              alt="Shieldnet-Access-logo"
            />

            <div className="flex flex-col items-center gap-3">
              <h2 className="text-3xl font-semibold leading-normal text-foreground">
                Set a new password
              </h2>
              <p className="text-sm text-muted-foreground">
                Almost there — create a password to finish resetting your
                account
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              className="w-full flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-5">
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Create Password</Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10"
                            {...field}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {passwordRequirements.map((req, index) => {
                          const isMet = req.test(passwordValue || "");
                          return (
                            <Badge
                              key={index}
                              className={`w-fit rounded-md text-xs leading-normal font-semibold flex items-center gap-1 ${
                                isMet
                                  ? "bg-green-100 text-sidebar-accent-foreground"
                                  : "bg-[#F1F5F9] text-[#737373]"
                              }`}
                            >
                              <CheckIcon className="size-3" />
                              {req.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="passwordConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            id="confirm-password"
                            type={
                              showPasswordConfirmation ? "text" : "password"
                            }
                            placeholder="Re-enter your password"
                            {...field}
                            className={cn(
                              "pr-10",
                              field.value !== "" &&
                                form.watch("password") &&
                                !passwordsMatch
                                ? "border-destructive! focus:border-destructive! focus:ring-destructive/20!"
                                : "border-border! focus:border-ring! focus-visible:ring-ring/20!",
                            )}
                          />
                        </FormControl>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowPasswordConfirmation((prev) => !prev)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          aria-label={
                            showPasswordConfirmation
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPasswordConfirmation ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <span className="h-5">
                        {field.value && !passwordsMatch ? (
                          <FormMessage>Password doesn’t match</FormMessage>
                        ) : null}
                      </span>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-fit self-end",
                  isFormValid
                    ? "bg-gradient-primary hover:bg-gradient-secondary"
                    : "bg-slate-400 text-primary-foreground cursor-not-allowed",
                )}
                disabled={!isFormValid}
              >
                Update password
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default SetPassword;
