import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/site/auth-shell";
import { AUTH_PHOTOS } from "@/lib/media";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      image={AUTH_PHOTOS.password}
      eyebrow="Account help"
      title="Forgot password"
      intro="Enter your email and we will send you a link to set a new password."
      headline="Back in a minute."
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}