import MainHeaderLayout from "@/components/dashboard/main/header";
import SidebarLayout from "@/components/dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <SidebarLayout />

        <SidebarInset className="flex-1 min-w-0">
          <div className="relative h-full flex flex-col">
            <MainHeaderLayout />

            {/* Main content — offset for fixed header */}
            <main className="flex-1 pt-20 overflow-y-auto">
              <div className="p-6 md:p-8 flex flex-col gap-6 min-h-full">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
