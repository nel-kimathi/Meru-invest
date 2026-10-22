"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { dashboardPathForRole } from "@/lib/roles";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    justVerified ? "Email verified. You can now log in." : null
  );
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    setPending(true);
    const { error } = await authClient.signIn.email({ email, password });
    setPending(false);

    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
        setError("Please verify your email before logging in.");
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    const { data: session } = await authClient.getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.push(dashboardPathForRole(role));
    router.refresh();
  }

  async function resendVerification() {
    if (!unverifiedEmail) return;
    await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/login?verified=1",
    });
    setNotice("Verification email resent. Check your inbox.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {notice ? <p className="text-sm text-green-600">{notice}</p> : null}
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" name="email" type="email" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput id="login-password" name="password" required />
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          {error}{" "}
          {unverifiedEmail ? (
            <button
              type="button"
              onClick={resendVerification}
              className="text-primary underline"
            >
              Resend verification email
            </button>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}