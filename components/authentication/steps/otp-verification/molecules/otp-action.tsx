"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Loading from "@/components/feedback/molecules/loading";
import { Button } from "@/components/ui/button";

import { useOtpVerificationContext } from "@/context/otp-verification";
import { AppDispatch, RootState } from "@/store";
import { requestOtp } from "@/store/features/admin/auth/slice";

function OTPAction() {
  const { timer } = useOtpVerificationContext();

  const dispatch = useDispatch<AppDispatch>();
  const identification = useSelector(
    (state: RootState) => state.adminAuth.onboardingState.identification,
  );

  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (timer) {
      setShowCountdown(true);
      setLoading(false);
    } else if (timer === "") {
      setLoading(true);
    } else if (timer === null) {
      setShowCountdown(false);
      setLoading(false);
    }
  }, [timer]);

  const handleNewRequest = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(requestOtp(identification as string)).unwrap();
    } catch (err) {
      console.error("Request OTP failed:", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch, identification]);

  return (
    <div className="w-full">
      {loading ? <Loading label="Sending request" /> : null}

      {showCountdown ? (
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-normal leading-normal text-muted-foreground">
            Request new code in
          </span>
          <span className="text-sm font-medium leading-normal text-foreground">
            {timer}
          </span>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center">
          <Button
            variant="link"
            onClick={handleNewRequest}
            className="gradient-underline text-gradient-primary request-new-otp-button"
          >
            Request new code
          </Button>
        </div>
      )}
    </div>
  );
}

export default OTPAction;
