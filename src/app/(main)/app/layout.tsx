import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <DashboardNavbar />
    </main>
  );
};

export default DashboardLayout;
