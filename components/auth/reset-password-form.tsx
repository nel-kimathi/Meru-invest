"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setPending(false);

    if (error) {
      setError("Could not reset password. The link may be expired or invalid.");
      return;
    }

    setNotice("Password reset successful. Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {notice ? <p className="text-sm text-green-600">{notice}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <PasswordInput
          id="new-password"
          name="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <PasswordInput
          id="confirm-password"
          name="confirm"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
