import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/site/auth-shell";
import { AUTH_PHOTOS } from "@/lib/media";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      image={AUTH_PHOTOS.password}
      eyebrow="Account help"
      title="Reset password"
      intro="Choose a new password for your account."
      headline="Almost there."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}