"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const DASHBOARD_ROLES = ["DELEGATE", "SPONSOR", "EXHIBITOR"] as const;

async function requireDashboardUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const role = (session.user as { role?: string }).role;
  if (!DASHBOARD_ROLES.includes(role as (typeof DASHBOARD_ROLES)[number])) {
    throw new Error("Forbidden");
  }
  return session;
}

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(50).optional(),
  organization: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
});

export async function getOwnProfile() {
  const session = await requireDashboardUser();
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      organization: true,
      country: true,
      category: true,
      role: true,
      registrationStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateOwnProfile(formData: FormData) {
  const session = await requireDashboardUser();

  const raw = Object.fromEntries(formData);
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    });
    revalidatePath("/delegate");
    revalidatePath("/sponsor");
    revalidatePath("/exhibitor");
    return { success: true };
  } catch {
    return { error: "Failed to update profile" };
  }
}

export async function getAnnouncements() {
  await requireDashboardUser();
  return prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      publishedAt: true,
    },
  });
}

export async function getAllocatedBooth() {
  const session = await requireDashboardUser();
  return prisma.booth.findFirst({
    where: { exhibitorId: session.user.id },
    include: { hall: true },
  });
}
