import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session if older than 1 day
  },
  advanced: {
    cookiePrefix: "miictf",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your MIICCOF account",
        html: `<p>Hello ${escapeHtml(user.name)},</p>
<p>Thank you for registering for the Meru International Investment Conference &amp; Consumer Fair.</p>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="${escapeHtml(url)}">Verify my email</a></p>
<p>If you did not create this account, you can ignore this email.</p>`,
      });
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      organization: { type: "string", required: false },
      country: { type: "string", required: false },
      // The participant type the person registered as. Maps to role below.
      category: { type: "string", required: false, defaultValue: "DELEGATE" },
      // Exposed on the session for redirects/guards, but never settable by
      // the client (input: false) — role is assigned server-side only.
      role: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Keep role server-controlled: derive it from the registration category
        // after the account is created. Role is never accepted from the client.
        after: async (user) => {
          const category = (user as { category?: string }).category;
          const role =
            category === "SPONSOR" || category === "EXHIBITOR"
              ? category
              : "DELEGATE";
          await prisma.user.update({ where: { id: user.id }, data: { role } });
        },
      },
    },
  },
});