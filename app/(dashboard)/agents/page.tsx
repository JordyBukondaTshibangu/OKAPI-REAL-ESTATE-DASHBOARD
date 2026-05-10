import { Suspense } from "react";
import Agents from "@/components/dashboard/main/agents";
import { Loading } from "@/components/common/loading";

function AgentsPage() {
  return (
    <Suspense fallback={<Loading label="Loading Agents" />}>
      <Agents />
    </Suspense>
  );
}

export default AgentsPage;
