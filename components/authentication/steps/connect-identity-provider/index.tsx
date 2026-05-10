import { ChevronLeftIcon } from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ProviderRadioGroup } from "@/components/tenant/common/idp-setup/connect-idp-provider";
import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";

const { SETUP_ROUTER_INIT } = ADMIN_ONBOARDING_STEPS;

export default function ConnectIdentityProvider() {
  const { moveToNextStep, setCurrentStep, moveToPreviousStep } =
    useMultiStepContext();
  const [provider, setProvider] = useState<string>("");

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      <div className="relative flex w-160 max-w-180 min-w-50 flex-col gap-10 rounded-lg border border-t-0 bg-card px-10 py-12 shadow-md">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 right-1 h-1 w-159.5 rounded-none rounded-tr-3xl bg-border"
        >
          <div className="h-1 w-151 rounded-tl-3xl bg-line-gradient" />
        </div>

        <div className="flex flex-col gap-6">
          <Button
            size="icon"
            variant="outline"
            className="w-8 h-8"
            aria-label="Go back"
            onClick={moveToPreviousStep}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-10">
          <ProviderRadioGroup value={provider} onValueChange={setProvider} />

          <div className="flex self-end gap-2 items-center">
            <Button
              variant="secondary"
              className="w-30.75 h-9"
              onClick={() => setCurrentStep(SETUP_ROUTER_INIT)}
            >
              Skip for now
            </Button>
            <Button
              disabled={!provider}
              onClick={() => moveToNextStep()}
              className="w-24 h-9 bg-gradient-primary hover:bg-gradient-secondary"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
