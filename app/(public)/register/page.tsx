import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthShell
      visual="pass"
      eyebrow="Registration"
      title="Create your account"
      intro="Register as a delegate, sponsor or exhibitor. We will email you a link to verify your address."
      points={["Your own dashboard and announcements", "Booth allocation for exhibitors", "Programme updates before anyone else"]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
