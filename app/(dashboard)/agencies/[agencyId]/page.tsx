import { Suspense } from "react";
import AgencyDetail from "@/components/dashboard/main/agencies/agency";
import { Loading } from "@/components/common/loading";

async function AgencyPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  return (
    <Suspense fallback={<Loading label="Loading Agency" />}>
      <AgencyDetail agencyId={agencyId} />
    </Suspense>
  );
}

export default AgencyPage;
