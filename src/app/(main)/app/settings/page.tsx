import AccountPanel from "@/components/auth/AccountPanel";
import {
  DashboardPage,
  PageHeader,
} from "@/components/dashboard/DashboardPrimitives";

export default function SettingsPage() {
  return (
    <DashboardPage className="max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage your profile, sign-in methods, sessions and account security."
      />
      <AccountPanel />
    </DashboardPage>
  );
}
