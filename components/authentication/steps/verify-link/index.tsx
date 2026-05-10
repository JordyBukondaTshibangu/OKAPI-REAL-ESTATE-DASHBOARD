import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import Loading from "@/components/feedback/molecules/loading";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { AppDispatch } from "@/store";
import { validateToken } from "@/store/features/admin/auth/slice";

const { ERR_INVALID_INVITATION_TOKEN, FAILED } = ONBOARDING_STATE_CODES;

const ERROR_CASES = [
  {
    icon: "/icons/unlink.png",
    title: "Invalid link",
    description: "This link doesn’t look right. Please check and try again",
    subText:
      "If you continue to have trouble, please contact our support team: support@shieldnet360.com.",
  },
] as const;

function ValidateToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const dispatch = useDispatch<AppDispatch>();

  const { setCurrentStep } = useMultiStepContext();

  const [caseIndex, setCaseIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const handleTokenVerification = useCallback(async () => {
    if (!token) {
      setCurrentStep(ADMIN_ONBOARDING_STEPS.IDENTIFICATION);
      setCaseIndex(0);
      setLoading(false);
      return;
    }

    try {
      const response = await dispatch(validateToken({ token })).unwrap();

      console.log(response);

      setCurrentStep(ADMIN_ONBOARDING_STEPS.CREATE_ACCOUNT);
    } catch (error) {
      console.error("Error validating token:", error);

      setCaseIndex(0);
    } finally {
      setLoading(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    handleTokenVerification();
  }, [handleTokenVerification]);

  const currentCase = ERROR_CASES[caseIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-muted">
        <Loading label="Verifying token" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-muted">
      <div className="relative mx-auto flex flex-col items-center justify-between w-full max-w-140 h-75 rounded-lg border border-t-0 bg-card py-12 px-10 gap-10 shadow-md">
        <div className="flex flex-col items-center justify-center gap-6 text-center w-120">
          <div className="flex items-center justify-center">
            <Image
              src={currentCase?.icon || "/icons/unlink.png"}
              width={52}
              height={52}
              alt="Status icon"
            />
          </div>

          <div className="flex flex-col items-center gap-3 h-32">
            <h2 className="text-3xl font-semibold leading-normal text-foreground">
              {currentCase?.title || "An error occurred"}
            </h2>
            <div className="flex flex-col gap-4 h-20">
              <p className="text-sm text-muted-foreground leading-5">
                {currentCase?.description ||
                  "Something went wrong while verifying the link. Please try again."}
              </p>
              {currentCase?.subText && (
                <p className="text-sm text-muted-foreground leading-5">
                  {currentCase.subText}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidateToken;
