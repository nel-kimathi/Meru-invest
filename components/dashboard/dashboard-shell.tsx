import * as React from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

export async function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const session = await getSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role ?? "User";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-primary">
              Meru Invest
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-block",
                role === "SUPER_ADMIN" && "bg-purple-100 text-purple-700",
                role === "ADMIN" && "bg-blue-100 text-blue-700",
                role === "DELEGATE" && "bg-green-100 text-green-700",
                role === "SPONSOR" && "bg-amber-100 text-amber-700",
                role === "EXHIBITOR" && "bg-cyan-100 text-cyan-700"
              )}
            >
              {role.replace("_", " ")}
            </span>
            <span className="text-sm text-muted-foreground">
              {user?.name ?? user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
