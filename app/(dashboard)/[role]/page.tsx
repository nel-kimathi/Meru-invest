import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { dashboardPathForRole, ROLE_DASHBOARD_PATHS } from "@/lib/roles";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DelegateDashboard } from "@/components/dashboard/delegate-dashboard";
import { getOwnProfile, getAnnouncements } from "@/lib/dashboard/actions";

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

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold capitalize text-primary">
          {role} Dashboard
        </h1>
        <SignOutButton />
      </div>

      <div className="mt-6">
        {role === "delegate" && <DelegateDashboardContent />}
        {role === "sponsor" && <SponsorDashboardStub />}
        {role === "exhibitor" && <ExhibitorDashboardStub />}
      </div>
    </main>
  );
}

async function DelegateDashboardContent() {
  const [user, announcements] = await Promise.all([getOwnProfile(), getAnnouncements()]);
  if (!user) {
    return <p className="text-muted-foreground">Unable to load your profile.</p>;
  }
  return <DelegateDashboard user={user} announcements={announcements} />;
}

function SponsorDashboardStub() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="font-medium">Sponsor dashboard</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your sponsor profile and benefits will appear here. This is the next module to build.
      </p>
    </div>
  );
}

function ExhibitorDashboardStub() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="font-medium">Exhibitor dashboard</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your exhibitor profile and booth allocation will appear here. This is the next module to build.
      </p>
    </div>
  );
}
