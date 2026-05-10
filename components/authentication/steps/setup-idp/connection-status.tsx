import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ConnectionStatusContent } from "@/components/tenant/common/idp-setup/connection-status-content";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { AppDispatch, RootState } from "@/store";
import { getStatus } from "@/store/features/admin/idp/slice";

export default function ConnectionSuccessful() {
  const dispatch = useDispatch<AppDispatch>();
  const { moveToNextStep, setCurrentStep } = useMultiStepContext();
  const { status } = useSelector((state: RootState) => state.adminIDP);

  useEffect(() => {
    dispatch(getStatus());
  }, [dispatch, status]);

  const handleAction = () => {
    if (status) {
      moveToNextStep();
    } else {
      setCurrentStep(ADMIN_ONBOARDING_STEPS.APP_REGISTRATION);
    }
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      <div className="flex w-160 max-w-180 min-w-50 h-73 flex-col gap-12 rounded-lg bg-card px-10 py-12 shadow-md items-center justify-center">
        <ConnectionStatusContent status={status} onAction={handleAction} />
      </div>
    </section>
  );
}
