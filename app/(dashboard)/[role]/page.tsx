import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dashboardPathForRole, ROLE_DASHBOARD_PATHS } from "@/lib/roles";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DelegateDashboard } from "@/components/dashboard/delegate-dashboard";
import { SponsorDashboard } from "@/components/dashboard/sponsor-dashboard";
import { ExhibitorDashboard } from "@/components/dashboard/exhibitor-dashboard";
import {
  getOwnProfile,
  getAnnouncements,
  getOwnSponsorProfile,
  getOwnExhibitorProfile,
  getAllocatedBooth,
} from "@/lib/dashboard/actions";

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!ROLE_DASHBOARD_PATHS.includes(`/${role}`)) {
    notFound();
  }

  const session = await getSession();
  if (!session || !session.user.emailVerified) {
    redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  const ownPath = dashboardPathForRole(userRole);
  if (ownPath !== `/${role}`) {
    redirect(ownPath);
  }

  const title = `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
  const subtitle = "Manage your profile, stay updated, and access your conference resources.";

  return (
    <DashboardShell title={title} subtitle={subtitle}>
      {role === "delegate" && <DelegateDashboardContent />}
      {role === "sponsor" && <SponsorDashboardContent />}
      {role === "exhibitor" && <ExhibitorDashboardContent />}
    </DashboardShell>
  );
}

async function DelegateDashboardContent() {
  const [user, announcements] = await Promise.all([getOwnProfile(), getAnnouncements()]);
  if (!user) {
    return <p className="text-muted-foreground">Unable to load your profile.</p>;
  }
  return <DelegateDashboard user={user} announcements={announcements} />;
}

async function SponsorDashboardContent() {
  const [user, profile, announcements] = await Promise.all([
    getOwnProfile(),
    getOwnSponsorProfile(),
    getAnnouncements(),
  ]);
  if (!user) {
    return <p className="text-muted-foreground">Unable to load your profile.</p>;
  }
  return <SponsorDashboard user={user} profile={profile} announcements={announcements} />;
}

async function ExhibitorDashboardContent() {
  const [user, profile, booth, announcements] = await Promise.all([
    getOwnProfile(),
    getOwnExhibitorProfile(),
    getAllocatedBooth(),
    getAnnouncements(),
  ]);
  if (!user) {
    return <p className="text-muted-foreground">Unable to load your profile.</p>;
  }
  return <ExhibitorDashboard user={user} profile={profile} booth={booth} announcements={announcements} />;
}
