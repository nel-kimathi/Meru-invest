"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const organization = String(data.get("organization") ?? "").trim();
    const country = String(data.get("country") ?? "").trim();
    const category = String(data.get("category") ?? "DELEGATE");
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      phone,
      organization,
      country,
      category,
      callbackURL: "/login?verified=1",
    });
    setPending(false);

    if (error) {
      setError(
        error.code === "USER_ALREADY_EXISTS"
          ? "An account with this email already exists."
          : (error.message ?? "Registration failed. Please try again.")
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <h2 className="font-heading text-lg font-semibold text-primary">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Click it to
          activate your account, then log in.
        </p>
        <Button className="mt-4" render={<Link href="/login" />}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reg-name">Full Name</Label>
        <Input id="reg-name" name="name" required maxLength={100} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input id="reg-email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone">Phone</Label>
          <Input id="reg-phone" name="phone" type="tel" maxLength={30} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-organization">Organization</Label>
          <Input id="reg-organization" name="organization" maxLength={150} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-country">Country</Label>
          <Input id="reg-country" name="country" maxLength={80} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-category">Registering as</Label>
        <select id="reg-category" name="category" className={inputClass} required>
          <option value="DELEGATE">Delegate</option>
          <option value="SPONSOR">Sponsor</option>
          <option value="EXHIBITOR">Exhibitor</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <PasswordInput
            id="reg-password"
            name="password"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm">Confirm Password</Label>
          <PasswordInput
            id="reg-confirm"
            name="confirm"
            required
            minLength={8}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}