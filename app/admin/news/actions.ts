"use server";

import { revalidatePath } from "next/cache";
import { refreshNews } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
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

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

const newsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  publishedAt: z.string().optional(),
});

export async function getNewsArticles() {
  await requireAdmin();
  return prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getNewsArticle(id: string) {
  await requireAdmin();
  return prisma.news.findUnique({ where: { id } });
}

export async function createNewsArticle(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { title, excerpt, content, coverImage, category, status, publishedAt } = parsed.data;
  const slug = generateSlug(title);

  try {
    const article = await prisma.news.create({
      data: {
        id: crypto.randomUUID(),
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        category: category || null,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });
    await logAdminAction({
      userId: session.user.id,
      action: "CREATE",
      entityType: "NEWS",
      entityId: article.id,
      details: { title, status },
    });
    revalidatePath("/admin/news");
    revalidatePath("/news");
    refreshNews();
    redirect("/admin/news");
  } catch {
    return { error: "Failed to create news article" };
  }
}

export async function updateNewsArticle(_prevState: unknown, formData: FormData) {
  const session = await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing article ID" };

  const raw = Object.fromEntries(formData);
  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const { title, excerpt, content, coverImage, category, status, publishedAt } = parsed.data;

  try {
    await prisma.news.update({
      where: { id },
      data: {
        title,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        category: category || null,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });
    await logAdminAction({
      userId: session.user.id,
      action: status === "PUBLISHED" ? "PUBLISH" : "UPDATE",
      entityType: "NEWS",
      entityId: id,
      details: { title, status },
    });
    revalidatePath("/admin/news");
    revalidatePath("/news");
    refreshNews();
    revalidatePath(`/news/${generateSlug(title)}`);
    redirect("/admin/news");
  } catch {
    return { error: "Failed to update news article" };
  }
}

export async function deleteNewsArticle(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing article ID" };

  try {
    await prisma.news.delete({ where: { id } });
    await logAdminAction({
      userId: session.user.id,
      action: "DELETE",
      entityType: "NEWS",
      entityId: id,
    });
    revalidatePath("/admin/news");
    revalidatePath("/news");
    refreshNews();
    return { success: true };
  } catch {
    return { error: "Failed to delete news article" };
  }
}
