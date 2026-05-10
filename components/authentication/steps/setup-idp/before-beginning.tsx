import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import Loading from "@/components/feedback/molecules/loading";
import { BeforeBeginningChecklist } from "@/components/tenant/common/idp-setup/before-beginning-checklist";
import DialogInfo from "@/components/tenant/common/info";
import { Button } from "@/components/ui/button";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { AppDispatch } from "@/store";
import { connectToMSEntra } from "@/store/features/admin/idp/slice";
import { ApiErrorResponse } from "@/types/error";

export default function BeforeBeginning() {
  const dispatch = useDispatch<AppDispatch>();
  const { moveToPreviousStep, moveToNextStep } = useMultiStepContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const connectToMicrosoftEntra = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await dispatch(connectToMSEntra()).unwrap();
      const { scimUrl, token } = data;

      if (scimUrl && token) {
        moveToNextStep();
      }

      setLoading(false);
    } catch (error) {
      console.error("Error", error);
      setLoading(false);

      const apiError = error as ApiErrorResponse;

      if (apiError.errorCode === ONBOARDING_STATE_CODES.SESSION_EXPIRED.code) {
        setShowDialog(true);
      }
    }
  }, [dispatch, moveToNextStep]);

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      {loading && <Loading label="Please wait" />}

      {showDialog && (
        <DialogInfo
          open={showDialog}
          buttonText="Restart"
          title="Session Expired"
          onOpenChange={() => window.location.reload()}
          description="Your current session has timed out due to inactivity. Tap below to restart"
        />
      )}

      <div className="relative flex w-160 max-w-180 min-w-50 min-h-115 flex-col gap-10 rounded-lg border border-t-0 bg-card px-10 py-12 shadow-md">
        <div className="flex flex-col gap-10">
          <div className="flex w-full justify-center items-end h-23">
            <h2 className="text-3xl leading-normal font-semibold text-card-foreground">
              Before we begin
            </h2>
          </div>

          <BeforeBeginningChecklist />
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex self-end gap-2 items-center">
            <Button
              variant="secondary"
              className="w-23.75 h-9"
              onClick={moveToPreviousStep}
            >
              Go back
            </Button>
            <Button
              onClick={connectToMicrosoftEntra}
              className="w-25 h-9 bg-gradient-primary hover:bg-gradient-secondary"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
