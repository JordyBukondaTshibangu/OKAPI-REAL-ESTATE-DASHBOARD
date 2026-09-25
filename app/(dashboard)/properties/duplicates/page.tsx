import { Suspense } from "react";
import DuplicateProperties from "@/components/dashboard/main/properties/duplicates";
import { Loading } from "@/components/common/loading";

export default function DuplicatesPage() {
  return (
    <Suspense fallback={<Loading label="Chargement des doublons…" />}>
      <DuplicateProperties />
    </Suspense>
  );
}
