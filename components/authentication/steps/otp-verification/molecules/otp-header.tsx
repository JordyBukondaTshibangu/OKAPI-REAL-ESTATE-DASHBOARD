import { ChevronLeftIcon } from "lucide-react";
import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";

import { useMultiStepContext } from "@/context/multi-step-navigator/tenant";
import { RootState } from "@/store";

function OTPHeader() {
  const { moveToPreviousStep } = useMultiStepContext();

  const identification = useSelector(
    (state: RootState) => state.adminAuth.onboardingState.identification,
  );

  return (
    <div className="flex flex-col gap-6">
      <Button
        size="icon"
        variant="outline"
        className="w-8 h-8"
        onClick={moveToPreviousStep}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>

      <div className="flex flex-col gap-3 w-full items-center">
        <h2 className="text-3xl leading-normal font-semibold text-muted-foreground">
          Check your email
        </h2>

        <p className="text-sm font-normal leading-normal text-muted-foreground">
          Enter the code we sent to {""}
          <span className="font-semibold">{identification}</span> to continue
        </p>
      </div>
    </div>
  );
}

export default OTPHeader;
