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

// --- Exhibition Halls ---

const hallSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function getHalls() {
  await requireAdmin();
  return prisma.exhibitionHall.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { booths: true } } },
  });
}

export async function saveHall(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = hallSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { id, name, description, order } = parsed.data;

  try {
    if (id) {
      await prisma.exhibitionHall.update({
        where: { id },
        data: { name, description, order },
      });
      await logAdminAction({
        userId: session.user.id,
        action: "UPDATE",
        entityType: "HALL",
        entityId: id,
        details: { name },
      });
    } else {
      const hall = await prisma.exhibitionHall.create({
        data: { name, description, order },
      });
      await logAdminAction({
        userId: session.user.id,
        action: "CREATE",
        entityType: "HALL",
        entityId: hall.id,
        details: { name },
      });
    }
    revalidatePath("/admin/booths");
    refreshBooths();
    return { success: true };
  } catch {
    return { error: "Failed to save hall. Name may already exist." };
  }
}

export async function deleteHall(formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { error: "Invalid hall ID" };

  try {
    await prisma.exhibitionHall.delete({ where: { id } });
    await logAdminAction({
      userId: session.user.id,
      action: "DELETE",
      entityType: "HALL",
      entityId: id,
    });
    revalidatePath("/admin/booths");
    refreshBooths();
    return { success: true };
  } catch {
    return { error: "Failed to delete hall" };
  }
}
