"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
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

import { ChallengeName, ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import {
  createAccount,
  setCompanyName,
} from "@/store/features/admin/auth/slice";
import { ApiError } from "@/types/error";
import { passwordRequirements } from "@/utils/password-requirements";

const { SUCCESS } = ChallengeName;

const { SESSION_EXPIRED } = ONBOARDING_STATE_CODES;

const formSchema = z
  .object({
    company: z
      .string()
      .min(2, {
        message: "Company name must be at least 2 characters.",
      })
      .regex(/^\S+$/, {
        message: "Company name cannot contain spaces.",
      }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password doesn’t match",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password doesn’t match",
    path: ["confirmPassword"],
  });

function CreateAccountForm() {
  const { moveToNextStep } = useMultiStepContext();

  const dispatch = useDispatch<AppDispatch>();

  const session = useSelector(
    (state: RootState) => state.adminAuth.onboardingState.session,
  );

  const localStorageSession = localStorage.getItem("session");

  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      company: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");

  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(passwordValue || ""),
  );

  const passwordsMatch =
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue;

  const isFormValid = allRequirementsMet && passwordsMatch;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      if (!session || !localStorageSession) return;

      dispatch(setCompanyName(values.company));

      const response = await dispatch(
        createAccount({
          companyName: values.company,
          password: values.password,
          passwordConfirmation: values.confirmPassword,
          session: session || localStorageSession,
        }),
      ).unwrap();

      if (response?.data?.challengeName === SUCCESS) {
        form.reset();
        moveToNextStep();
      }
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.errorCode === "ERR_WORKSPACE_NAME_ALREADY_EXISTS") {
        form.setError("company", {
          message: apiError.detail,
        });
      }

      if (apiError.errorCode === SESSION_EXPIRED.code) {
        setShowDialog(true);
      }
      setLoading(false);
      console.error("OTP Request failed:", err);
    }

    setLoading(false);
  }

  return (
    <>
      {loading ? <Loading label="Creating your account" /> : null}

      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}

      <Form {...form}>
        <form
          className="w-full flex flex-col gap-10"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <Label>Company name</Label>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="Enter your company name"
                      {...field}
                    />
                  </FormControl>
                  <span className="h-5">
                    <FormMessage />
                  </span>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Create Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      className="pr-10"
                    />

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
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <FormControl>
                      <Input
                        id="confirm-password"
                        type={showPasswordConfirmation ? "text" : "password"}
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
            Continue
          </Button>
        </form>
      </Form>
    </>
  );
}

export default CreateAccountForm;
