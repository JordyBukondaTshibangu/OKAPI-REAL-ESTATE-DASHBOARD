import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { VerifyingConnectionContent } from "@/components/tenant/common/idp-setup/verifying-connection-content";

import DialogInfo from "@/components/tenant/common/info";
import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { AppDispatch } from "@/store";
import { verifyStatus } from "@/store/features/admin/idp/slice";
import { ApiError } from "@/types/error";

export default function VerifyingConnection() {
  const dispatch = useDispatch<AppDispatch>();
  const { moveToNextStep } = useMultiStepContext();

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleVerifyStatus = useCallback(async () => {
    try {
      await dispatch(verifyStatus()).unwrap();
      moveToNextStep();
    } catch (error) {
      console.error("Error", error);

      const apiError = error as ApiError;

      if (apiError.errorCode === ONBOARDING_STATE_CODES.SESSION_EXPIRED.code) {
        setShowDialog(true);
      }
    }
  }, [dispatch, moveToNextStep]);

  useEffect(() => {
    handleVerifyStatus();
  }, [handleVerifyStatus]);

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}

      <div className="flex w-160 max-w-180 min-w-50 min-h-65 flex-col gap-6 rounded-lg bg-card px-10 py-12 shadow-md items-center justify-center">
        <VerifyingConnectionContent />
      </div>
    </section>
  );
}
