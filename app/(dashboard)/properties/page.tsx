import { Suspense } from "react";
import Properties from "@/components/dashboard/main/properties";
import { Loading } from "@/components/common/loading";

function PropertiesPage() {
  return (
    <Suspense fallback={<Loading label="Loading Properties" />}>
      <Properties />
    </Suspense>
  );
}

export default PropertiesPage;
