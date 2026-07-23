import { Suspense } from "react";
import BoostsQueue from "@/components/dashboard/main/boosts";
import { Loading } from "@/components/common/loading";

export default function BoostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File de boosts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Demandes de boost en attente de validation — classées par date de soumission (les plus anciennes en premier).
        </p>
      </div>
      <Suspense fallback={<Loading label="Chargement des boosts…" />}>
        <BoostsQueue />
      </Suspense>
    </div>
  );
}
