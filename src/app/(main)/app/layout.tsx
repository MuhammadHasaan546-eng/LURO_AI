import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          {/* Top Navbar */}
          <DashboardNavbar />

          <main className="flex flex-1 size-full">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <div className="flex-1 pt-16 w-full min-w-0 transition-all duration-300">
              {/* Mobile Sidebar Toggle Button */}
              <div className="p-4 lg:hidden">
                <SidebarTrigger />
              </div>

              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default DashboardLayout;
