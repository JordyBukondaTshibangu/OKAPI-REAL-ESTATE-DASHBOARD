import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export function ResetPasswordAllDone() {
  const router = useRouter();

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-muted">
      <div className="flex w-160 max-w-180 min-w-50 h-81 flex-col gap-12 rounded-lg border bg-card px-10 py-12 shadow-md">
        <div className="flex flex-col gap-8 items-center">
          <div className="w-13 h-13 flex items-center justify-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <Check className="h-6 w-6 text-white" />
            </span>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-3xl font-semibold text-card-foreground">
              We&apos;re all done!
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Your password has been reset.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-47.5 h-9 bg-gradient-primary hover:bg-gradient-secondary"
          >
            Continue to dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
