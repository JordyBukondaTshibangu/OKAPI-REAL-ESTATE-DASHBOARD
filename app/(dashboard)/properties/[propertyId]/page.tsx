import { Loading } from "@/components/common/loading";
import PropertyDetail from "@/components/dashboard/main/properties/property";
import { Suspense } from "react";

async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  return (
    <Suspense fallback={<Loading label="Loading Property" />}>
      <PropertyDetail propertyId={propertyId} />
    </Suspense>
  );
}

export default PropertyPage;
