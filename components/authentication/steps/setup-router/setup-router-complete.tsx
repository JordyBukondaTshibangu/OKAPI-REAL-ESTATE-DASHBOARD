import RouterSetupInitiated from "@/components/tenant/common/router-setup/router-setup-initiated";
import { useRouter } from "next/navigation";

export default function SetupRouterInit() {
  const router = useRouter();

  return (
    <RouterSetupInitiated fullPage onDone={() => router.push("/dashboard")} />
  );
}
