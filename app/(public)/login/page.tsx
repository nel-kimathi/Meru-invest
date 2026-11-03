import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/site/auth-shell";
import { AUTH_PHOTOS } from "@/lib/media";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AuthShell
      image={AUTH_PHOTOS.login}
      eyebrow="Welcome back"
      title="Sign in"
      intro="Sign in to see your dashboard, announcements and booth details."
      headline="Good to see you again."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}