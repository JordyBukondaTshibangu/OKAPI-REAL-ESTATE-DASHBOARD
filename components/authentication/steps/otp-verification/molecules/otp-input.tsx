"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";

import DialogInfo from "@/components/tenant/common/info";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { ChallengeName, ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { verifyOtp } from "@/store/features/admin/auth/slice";
import { AuthChallengeResponse } from "@/store/features/admin/auth/type";

import { ApiError } from "@/types/error";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const { PASSWORD_REQUIRED, VERIFY_PASSWORD_REQUIRED } = ChallengeName;
const {
  SESSION_EXPIRED,
  OTP_CODE_EXPIRED,
  OTP_CODE_INVALID,
  OTP_ATTEMPTS_EXCEEDED,
} = ONBOARDING_STATE_CODES;

const FormSchemaOtp = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function OTPInput() {
  const { moveToNextStep, setCurrentStep } = useMultiStepContext();

  const dispatch = useDispatch<AppDispatch>();

  const session = localStorage.getItem("session");

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleSubmit, control, setValue, reset } = useForm<
    z.infer<typeof FormSchemaOtp>
  >({
    resolver: zodResolver(FormSchemaOtp),
    defaultValues: {
      pin: "",
    },
  });

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        reset({ pin: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, reset]);

  function onChangePin(value: string) {
    setValue("pin", value);
    if (value.length === 6) {
      handleSubmit(onSubmitOtp)();

      // remove focus on the last input
      const inputs = document.querySelectorAll("input");
      const lastInput = inputs[inputs.length - 1];
      lastInput.blur();
    }
  }

  async function onSubmitOtp(data: z.infer<typeof FormSchemaOtp>) {
    try {
      if (!session) return;

      const response: AuthChallengeResponse = await dispatch(
        verifyOtp({ otp: data.pin, session }),
      ).unwrap();

      if (response?.data?.challengeName === PASSWORD_REQUIRED) {
        moveToNextStep();
      } else if (response?.data?.challengeName === VERIFY_PASSWORD_REQUIRED) {
        setCurrentStep(ADMIN_ONBOARDING_STEPS.SIGN_IN);
      }

      if (response?.errorCode === OTP_CODE_INVALID.code) {
        setErrorMessage(
          `Invalid OTP` +
            `${
              response?.errorParams?.attemptsLeft &&
              response?.errorParams?.attemptsLeft
            } > 1 ? ${response?.errorParams?.attemptsLeft} attempts left : ${
              response?.errorParams?.attemptsLeft
            } attempt left`,
        );
      } else if (response?.errorCode === OTP_ATTEMPTS_EXCEEDED.code) {
        setErrorMessage(OTP_ATTEMPTS_EXCEEDED.message);
      } else if (response?.errorCode === OTP_CODE_EXPIRED.code) {
        setErrorMessage(OTP_CODE_EXPIRED.message);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;

      switch (apiError.errorCode) {
        case OTP_CODE_INVALID.code:
          setErrorMessage(
            `Invalid OTP, ${
              apiError.errorParams?.attemptsLeft ?? 0
            } attempts left`,
          );
          break;

        case OTP_ATTEMPTS_EXCEEDED.code:
          setErrorMessage(OTP_ATTEMPTS_EXCEEDED.message);
          break;

        case OTP_CODE_EXPIRED.code:
          setErrorMessage(OTP_CODE_EXPIRED.message);
          break;

        case SESSION_EXPIRED.code:
          setErrorMessage(SESSION_EXPIRED.message);
          setShowDialog(true);
          break;

        default:
          setErrorMessage(apiError.detail || "Something went wrong");
          break;
      }
    }
  }

  return (
    <form
      className="w-full flex items-center justify-center flex-col gap-4"
      onSubmit={handleSubmit(onSubmitOtp)}
    >
      <Controller
        control={control}
        name="pin"
        render={({ field }) => (
          <InputOTP
            pattern={REGEXP_ONLY_DIGITS}
            className="flex items-center gap-3"
            value={field.value}
            onChange={(val) => {
              field.onChange(val);
              onChangePin(val);
            }}
            maxLength={6}
          >
            <InputOTPGroup className="flex gap-2!">
              {[0, 1, 2].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "size-9 rounded-md border border-input text-sm font-normal text-center text-foreground bg-background transition focus:border-primary focus:ring-2 focus:ring-ring",
                    errorMessage && "border-destructive",
                  )}
                />
              ))}
            </InputOTPGroup>

            <InputOTPSeparator className="text-muted-foreground text-lg font-medium" />

            <InputOTPGroup className="flex gap-2!">
              {[3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "size-9 rounded-md border border-input text-sm font-normal text-center text-foreground bg-background transition focus:border-primary focus:ring-2 focus:ring-ring",
                    errorMessage && "border-destructive",
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        )}
      />
      <span className="text-sm leading-normal font-normal text-destructive h-5">
        {errorMessage}
      </span>

      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}
    </form>
  );
}

export default OTPInput;
