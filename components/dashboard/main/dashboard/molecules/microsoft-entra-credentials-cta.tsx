"use client";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";

function MicrosoftEntraCredentialsCTA() {
  const router = useRouter();

  const handleRouting = () => {
    router.push("/settings/identity-provider?mode=edit");
  };
  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-destructive bg-muted/20 px-5 pl-6 py-4">
        <div className="flex items-center gap-4">
          <Info className="w-9 h-9 p-2 text-destructive rounded-full" />

          <div className="flex flex-col gap-1">
            <p className="text-sm leading-normal text-destructive">
              Your Microsoft Entra credentials are invalid or expired. Please
              update them to maintain access.
            </p>
          </div>
        </div>

        <Button className="bg-gradient-primary" onClick={handleRouting}>
          Update credentials
        </Button>
      </div>
    </>
  );
}

export default MicrosoftEntraCredentialsCTA;
