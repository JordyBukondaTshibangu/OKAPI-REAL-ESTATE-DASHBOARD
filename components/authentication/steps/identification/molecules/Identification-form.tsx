"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";

import DialogInfo from "@/components/tenant/common/info";
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
import { Separator } from "@radix-ui/react-separator";

import AppleIcon from "../atoms/apple-icon";
import AzureIcon from "../atoms/azure-icon";
import GoogleIcon from "../atoms/google-icon";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { useOtpVerificationContext } from "@/context/otp-verification";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import {
  requestOtp,
  setIdentification,
} from "@/store/features/admin/auth/slice";
import { ApiError } from "@/types/error";

const { OTP_RESEND_ATTEMPTS_EXCEEDED } = ONBOARDING_STATE_CODES;

const formSchema = z.object({
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
});

function WelcomeForm() {
  const dispatch = useDispatch<AppDispatch>();

  const { identification } = useSelector(
    (state: RootState) => state.adminAuth.onboardingState,
  );

  const { error } = useSelector((state: RootState) => state.adminAuth);

  const { moveToNextStep } = useMultiStepContext();
  const { timer } = useOtpVerificationContext();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { email: identification || "" },
    reValidateMode: "onChange",
  });

  const emailValue = form.watch("email");
  const isEmailValid = form.formState.isValid;
  const isButtonDisabled = !isEmailValid || !emailValue;

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (timer && identification === values.email) {
        moveToNextStep();
        return;
      }

      if (!values.email) {
        form.setError("email", { message: "Email is required" });
        return;
      }

      try {
        dispatch(setIdentification(values.email));
        const response = await dispatch(requestOtp(values.email)).unwrap();

        if (!response?.errorCode) {
          form.reset();

          moveToNextStep();
        } else if (response?.errorCode === OTP_RESEND_ATTEMPTS_EXCEEDED.code) {
          setErrorMessage(OTP_RESEND_ATTEMPTS_EXCEEDED.message);
          setShowDialog(true);
        }
      } catch (err) {
        setShowDialog(true);

        console.error("OTP Request failed:", err);

        const apiError = err as ApiError;
        setErrorMessage(apiError?.detail || apiError?.title || "Error");
      }
    },
    [timer, identification, moveToNextStep, form, dispatch, setShowDialog],
  );

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      {showDialog && (
        <DialogInfo
          open={showDialog || Boolean(error)}
          buttonText="Ok"
          title="Request Failed"
          onOpenChange={(open) => !open && setShowDialog(false)}
          description={errorMessage || error?.detail || error?.title || "Error"}
        />
      )}
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-90 h-99.5">
        <div className="w-full flex flex-col gap-3 text-center sm:text-left">
          <h1 className="text-3xl font-semibold text-card-foreground min-w-max">
            Welcome to Okapi Real Estate
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to continue
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full flex flex-col gap-4">
                  <Label>Email</Label>
                  <FormControl>
                    <Input
                      autoFocus
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <span className="h-5">
                    <FormMessage />
                  </span>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className={cn(
                "w-full",
                !isButtonDisabled
                  ? "bg-gradient-primary hover:bg-gradient-secondary"
                  : "bg-slate-400 text-primary-foreground cursor-not-allowed",
              )}
              disabled={isButtonDisabled}
            >
              Continue
            </Button>
          </form>
        </Form>
        <div className="hidden flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <Separator
              orientation="horizontal"
              className="w-[67.5px] h bg-border h-px"
            />
            <span className="text-muted-foreground text-xs leading-normal font-normal">
              OR
            </span>
            <Separator
              orientation="horizontal"
              className="w-[67.5px] h bg-border h-px"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              disabled
              size="icon"
              type="button"
              variant="outline"
              className="w-30.5 h-9"
            >
              <AppleIcon />
            </Button>

            <Button
              disabled
              size="icon"
              type="button"
              variant="outline"
              className="w-30.5 h-9"
            >
              <GoogleIcon />
            </Button>

            <Button
              disabled
              size="icon"
              type="button"
              variant="outline"
              className="w-30.5 h-9"
            >
              <AzureIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeForm;
