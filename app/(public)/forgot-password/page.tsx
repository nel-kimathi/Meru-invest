import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md px-4 pb-12 pt-28">
      <h1 className="font-heading text-center text-3xl font-bold text-primary">
        Forgot Password
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter your email and we will send you a reset link.
      </p>
      <div className="mt-8">
        <Suspense>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </section>
  );
}
