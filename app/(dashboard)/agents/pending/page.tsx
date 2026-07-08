import { Suspense } from "react";
import PendingAgents from "@/components/dashboard/main/agents/pending";
import { Loading } from "@/components/common/loading";

function PendingAgentsPage() {
  return (
    <Suspense fallback={<Loading label="Chargement de la file d'approbation" />}>
      <PendingAgents />
    </Suspense>
  );
}

export default PendingAgentsPage;
