import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 pb-12 pt-28">
      <h1 className="font-heading text-center text-3xl font-bold text-primary">
        Reset Password
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter your new password below.
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </section>
  );
}
