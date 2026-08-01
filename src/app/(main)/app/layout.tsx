import { redirect } from "next/navigation";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentSession } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = async ({ children }: Props) => {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full flex-col">
          {/* Top Navbar */}
          <DashboardNavbar />

          <main className="flex flex-1 size-full">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <div className="flex-1 pt-16 w-full min-w-0 transition-all duration-300">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default DashboardLayout;
