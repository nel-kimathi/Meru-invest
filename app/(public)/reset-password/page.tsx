import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Account help" title="Reset password" intro="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
