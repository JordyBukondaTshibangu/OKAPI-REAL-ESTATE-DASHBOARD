"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

import Loading from "@/components/feedback/molecules/loading";
import {
  MicrosoftEntraCredentialFields,
  MicrosoftEntraCredentialForm,
} from "@/components/tenant/common/idp-setup/microsoft-entra-credential-fields";
import DialogInfo from "@/components/tenant/common/info";
import ExitDialog from "@/components/tenant/onboarding/dialog/exit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { ONBOARDING_STATE_CODES } from "@/constants/onboarding";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { useIDPCredentials } from "@/hooks/use-idp-credentials";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { createClientSetupIDP } from "@/store/features/admin/idp/slice";
import { ApiError, ApiErrorResponse } from "@/types/error";
import { IDP_ERROR_MAP } from "@/utils/idp-errors";

export function MicrosoftEntraCredential() {
  const dispatch = useDispatch<AppDispatch>();

  const { setCurrentStep, moveToNextStep } = useMultiStepContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [openExistDialog, setOpenExistDialog] = useState<boolean>(false);

  const form = useForm<MicrosoftEntraCredentialForm>({
    mode: "onChange",
    defaultValues: {
      tenantId: "",
      clientId: "",
      clientSecret: "",
    },
  });

  const {
    reset,
    control,
    register,
    setError,
    handleSubmit,
    formState: { isValid },
  } = form;

  useIDPCredentials(reset);

  const handleApiError = useCallback(
    (error: ApiError) => {
      const mapped = IDP_ERROR_MAP[error.errorCode];

      if (mapped) {
        setError(mapped.field, {
          type: "server",
          message: mapped.message,
        });
        return;
      }

      setError("tenantId", {
        type: "server",
        message: error.detail ?? "Something went wrong. Please try again.",
      });
    },
    [setError],
  );

  const onSubmit = useCallback(
    async (values: MicrosoftEntraCredentialForm) => {
      setLoading(true);
      try {
        await dispatch(createClientSetupIDP(values)).unwrap();
        moveToNextStep();
      } catch (error) {
        console.error("Error", error);

        const apiError = error as ApiErrorResponse;

        if (
          apiError.errorCode === ONBOARDING_STATE_CODES.SESSION_EXPIRED.code
        ) {
          setShowDialog(true);
        }

        handleApiError(error as ApiError);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, handleApiError, moveToNextStep],
  );

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      {loading && <Loading label="Validating" />}

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
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6 w-full items-center">
                <Badge variant="outline" className="self-end h-5">
                  Step 4/6
                </Badge>
                <h2 className="text-3xl leading-normal font-semibold text-card-foreground h-9">
                  Microsoft Entra ID credentials
                </h2>
              </div>

              <MicrosoftEntraCredentialFields
                control={control}
                register={register}
              />
            </div>

            <div className="flex self-end gap-2 items-center">
              <Button
                type="button"
                variant="secondary"
                className="w-16.25 h-9"
                onClick={() => setOpenExistDialog(true)}
              >
                Exit
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className={cn(
                  "w-18 h-9",
                  isValid && "bg-gradient-primary hover:bg-gradient-secondary",
                )}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ExitDialog
        open={openExistDialog}
        onClose={() => setOpenExistDialog(false)}
        onExit={() => setCurrentStep(ADMIN_ONBOARDING_STEPS.SETUP_ROUTER_INIT)}
      />
    </section>
  );
}
