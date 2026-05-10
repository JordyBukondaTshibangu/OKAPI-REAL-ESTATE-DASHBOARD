import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { AppRegistrationInstructions } from "@/components/tenant/common/idp-setup/app-registration-instructions";
import ExitDialog from "@/components/tenant/onboarding/dialog/exit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import DialogInfo from "@/components/tenant/common/info";
import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { RootState } from "@/store";
import { ApiErrorResponse } from "@/types/error";

export default function AppRegistrationStep() {
  const { moveToNextStep, setCurrentStep } = useMultiStepContext();

  const { scimUrl, token } = useSelector((state: RootState) => state.adminIDP);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [openExistDialog, setOpenExistDialog] = useState<boolean>(false);

  const handleContinue = useCallback(() => {
    try {
      moveToNextStep();
    } catch (error) {
      console.error("Error", error);

      const apiError = error as ApiErrorResponse;

      if (apiError.errorCode === ONBOARDING_STATE_CODES.SESSION_EXPIRED.code) {
        setShowDialog(true);
      }
    }
  }, [moveToNextStep]);

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

      <div className="relative flex w-160 max-w-180 min-w-50 min-h-115 flex-col gap-10 rounded-lg border border-t-0 bg-card px-10 py-12 shadow-md">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6 w-full items-center">
            <Badge variant="outline" className="self-end h-5">
              Step 1/5
            </Badge>
            <h2 className="text-3xl leading-normal font-semibold text-card-foreground h-9">
              App registration
            </h2>
          </div>

          <AppRegistrationInstructions scimUrl={scimUrl!} token={token!} />
        </div>

        <div className="flex self-end gap-2 items-center">
          <Button
            variant="secondary"
            className="w-16.25 h-9"
            onClick={() => setOpenExistDialog(true)}
          >
            Exit
          </Button>
          <Button
            onClick={handleContinue}
            className="w-20.75 h-9 bg-gradient-primary hover:bg-gradient-secondary"
          >
            Next
          </Button>
        </div>
      </div>

      <ExitDialog
        open={openExistDialog}
        onClose={() => setOpenExistDialog(false)}
        onExit={() => setCurrentStep(ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_INIT)}
      />
    </section>
  );
}
