import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role, RegistrationCategory, RegistrationStatus } from "@/lib/generated/prisma/client";

const TEMP_SECRET = "miiccof-quick-fix-2026";

const TEST_ACCOUNTS: Array<{
  email: string;
  name: string;
  password: string;
  role: Role;
  category: RegistrationCategory;
}> = [
  { email: "superadmin@test.local", name: "Super Admin", password: "Password123!", role: Role.SUPER_ADMIN, category: RegistrationCategory.DELEGATE },
  { email: "admin@test.local", name: "Admin User", password: "Password123!", role: Role.ADMIN, category: RegistrationCategory.DELEGATE },
  { email: "delegate@test.local", name: "Test Delegate", password: "Password123!", role: Role.DELEGATE, category: RegistrationCategory.DELEGATE },
  { email: "sponsor@test.local", name: "Test Sponsor", password: "Password123!", role: Role.SPONSOR, category: RegistrationCategory.SPONSOR },
  { email: "exhibitor@test.local", name: "Test Exhibitor", password: "Password123!", role: Role.EXHIBITOR, category: RegistrationCategory.EXHIBITOR },
];

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== TEMP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = req.nextUrl.origin;
    const results = [];

    for (const account of TEST_ACCOUNTS) {
      // Remove any existing user/account so we can recreate with a known password.
      const existing = await prisma.user.findUnique({
        where: { email: account.email },
        include: { accounts: true },
      });
      if (existing) {
        await prisma.user.delete({ where: { id: existing.id } });
      }

      // Sign up via Better Auth so the password is hashed correctly.
      const signupRes = await fetch(`${origin}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          name: account.name,
          phone: "+254700000000",
          organization: "MIICCOF Test",
          country: "Kenya",
          category: account.category,
        }),
      });

      if (!signupRes.ok) {
        const error = await signupRes.json().catch(() => ({ message: "Sign-up failed" }));
        results.push({ email: account.email, action: "signup_failed", error: error.message });
        continue;
      }

      // Verify email, set role, and approve registration.
      await prisma.user.update({
        where: { email: account.email },
        data: {
          emailVerified: true,
          role: account.role,
          category: account.category,
          registrationStatus: RegistrationStatus.APPROVED,
        },
      });

      results.push({ email: account.email, action: "created" });
    }

    return NextResponse.json({ message: "Test accounts ready", results });
  } catch (error) {
    console.error("Setup test accounts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
