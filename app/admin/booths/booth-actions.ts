"use server";

import { revalidatePath } from "next/cache";
import { refreshBooths } from "@/lib/cache-tags";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { logAdminAction } from "@/lib/admin/system-log";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const role = (session.user as { role?: string }).role;
  if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    throw new Error("Forbidden");
  }
  return session;
}

const boothSchema = z.object({
  id: z.string().optional(),
  hallId: z.string().min(1, "Hall is required"),
  number: z.string().min(1, "Booth number is required").max(50),
  size: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "ALLOCATED", "OCCUPIED"]),
  price: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export async function getBooths(hallId?: string) {
  await requireAdmin();
  return prisma.booth.findMany({
    where: hallId ? { hallId } : undefined,
    orderBy: [{ hall: { order: "asc" } }, { number: "asc" }],
    include: {
      hall: { select: { id: true, name: true } },
      exhibitor: { select: { id: true, name: true, email: true, organization: true } },
    },
  });
}

export async function saveBooth(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = boothSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { id, hallId, number, size, category, status, price, notes } = parsed.data;

  try {
    if (id) {
      await prisma.booth.update({
        where: { id },
        data: { hallId, number, size, category, status, price, notes },
      });
      await logAdminAction({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "BOOTH",
        entityId: id,
        details: { number, status },
      });
    } else {
      const booth = await prisma.booth.create({
        data: { hallId, number, size, category, status, price, notes },
      });
      await logAdminAction({
        userId: session.user.id,
        action: "CREATE",
        entityType: "BOOTH",
        entityId: booth.id,
        details: { number, status },
      });
    }
    revalidatePath("/admin/booths");
    refreshBooths();
    return { success: true };
  } catch {
    return { error: "Failed to save booth. Number may already exist in this hall." };
  }
}

export async function deleteBooth(formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Invalid booth ID" };

  try {
    await prisma.booth.delete({ where: { id } });
    await logAdminAction({
      userId: session.user.id,
      action: "DELETE",
      entityType: "BOOTH",
      entityId: id,
    });
    revalidatePath("/admin/booths");
    refreshBooths();
    return { success: true };
  } catch {
    return { error: "Failed to delete booth" };
  }
}

const assignSchema = z.object({
  boothId: z.string(),
  exhibitorId: z.string().optional(),
});

export async function assignExhibitor(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = assignSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { boothId, exhibitorId } = parsed.data;

  try {
    await prisma.booth.update({
      where: { id: boothId },
      data: {
        exhibitorId: exhibitorId || null,
        status: exhibitorId ? "ALLOCATED" : "AVAILABLE",
      },
    });
    await logAdminAction({
      userId: session.user.id,
      action: exhibitorId ? "ASSIGN" : "UNASSIGN",
      entityType: "BOOTH",
      entityId: boothId,
      details: { exhibitorId },
    });
    revalidatePath("/admin/booths");
    refreshBooths();
    return { success: true };
  } catch {
    return { error: "Failed to assign exhibitor" };
  }
}

export async function getAvailableExhibitors() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: "EXHIBITOR", registrationStatus: "APPROVED" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, organization: true },
  });
}
