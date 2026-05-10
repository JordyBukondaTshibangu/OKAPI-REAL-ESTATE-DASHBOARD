import { Suspense } from "react";
import AgentDetail from "@/components/dashboard/main/agents/agent";
import { Loading } from "@/components/common/loading";

async function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return (
    <Suspense fallback={<Loading label="Loading Agent" />}>
      <AgentDetail agentId={agentId} />
    </Suspense>
  );
}

export default AgentPage;
