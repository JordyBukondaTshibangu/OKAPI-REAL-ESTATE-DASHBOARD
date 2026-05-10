import { Progress } from "@/components/ui/progress";
import StrikeIcon from "../atoms/strike-icon";

function WelcomeHero() {
  return (
    <div className="hidden lg:flex items-end justify-center h-[90vh] w-full bg-[url('/images/onboarding-hero.png')] bg-cover bg-no-repeat rounded-xl overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-16 p-6">
        <div className="flex flex-col gap-7 items-center justify-center px-12">
          <span className="flex items-center justify-center size-12">
            <StrikeIcon />
          </span>
          <h2 className="text-white text-3xl leading-normal font-medium text-center">
            Smart access control for every request
          </h2>
          <p className="text-center text-base leading-normal font-normal text-white/80">
            Continuously verifies identity, device, and context to secure every
            access attempt with Absolute precision
          </p>
        </div>

        <div className="w-full flex gap-2 items-center justify-between">
          <Progress className="bg-white/70 [&>div]:!bg-white" value={50} />
          <Progress className="bg-white/70" />
          <Progress className="bg-white/70" />
          <Progress className="bg-white/70" />
        </div>
      </div>
    </div>
  );
}

export default WelcomeHero;
