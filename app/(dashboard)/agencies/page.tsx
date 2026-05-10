import { Loading } from "@/components/common/loading";
import Agencies from "@/components/dashboard/main/agencies";
import { Suspense } from "react";

function AgenciesPage() {
  return (
    <Suspense fallback={<Loading label="Loading Agencies" />}>
      <Agencies />
    </Suspense>
  );
}

export default AgenciesPage;
