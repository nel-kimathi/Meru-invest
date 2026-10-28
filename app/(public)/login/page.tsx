import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Welcome back" title="Sign in" intro="Sign in to your MIICCOF account to see your dashboard, announcements and booth details.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
