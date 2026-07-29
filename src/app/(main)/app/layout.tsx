import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DashboardLayout;
