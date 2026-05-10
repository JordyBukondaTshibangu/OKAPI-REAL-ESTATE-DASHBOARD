import { useRouter } from "next/navigation";

import { AllDoneContent } from "@/components/tenant/common/idp-setup/all-done-content";
import { Button } from "@/components/ui/button";

export function AllDone() {
  const router = useRouter();

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      <div className="flex w-160 max-w-180 min-w-50 flex-col gap-12 rounded-lg border bg-card px-10 py-12 shadow-md">
        <AllDoneContent />

        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-25 h-9 bg-gradient-primary hover:bg-gradient-secondary"
          >
            Continue
          </Button>
        </div>
      </div>
    </section>
  );
}
