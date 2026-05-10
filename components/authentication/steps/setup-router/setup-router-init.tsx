import { ChevronLeftIcon, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ADMIN_ONBOARDING_STEPS } from "@/constants/steps";
import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";

const { CONNECT_IDENTITY_PROVIDER } = ADMIN_ONBOARDING_STEPS;

export default function SetupRouterInit() {
  const { moveToNextStep, setCurrentStep } = useMultiStepContext();

  const router = useRouter();

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
            onClick={() => setCurrentStep(CONNECT_IDENTITY_PROVIDER)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <div className="flex flex-col gap-3 w-full items-center">
            <h2 className="text-3xl leading-normal font-semibold text-card-foreground">
              Set up a router
            </h2>

            <p className="text-sm font-normal leading-normal text-muted-foreground text-center">
              Routers securely connect your environment to your workspace.
              Create one to proceed with deployment.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex gap-1 items-center min-w-max">
            <InfoIcon className="h-4 w-4" />

            <p className="text-xs leading-normal font-normal text-muted-foreground">
              You can set this up later, but resources cannot be added or
              connected until a router is installed.
            </p>
          </div>

          <div className="flex self-end gap-2 items-center">
            <Button
              variant="secondary"
              className="w-30.75 h-9"
              onClick={() => router.push("/dashboard")}
            >
              Skip for now
            </Button>
            <Button
              className="w-20.75 h-9 bg-gradient-primary hover:bg-gradient-secondary"
              onClick={() => moveToNextStep()}
            >
              Set up
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
