import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";
import type { PoolConfig } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawUrl = process.env.DATABASE_URL ?? "";
const isRemote = rawUrl.includes("tidbcloud.com");

let poolConfig: PoolConfig | string;
if (isRemote) {
  const parsed = new URL(rawUrl);
  poolConfig = {
    host: parsed.hostname,
    port: Number(parsed.port) || 4000,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: true },
    allowPublicKeyRetrieval: true,
    charset: "utf8mb4",
  };
} else {
  poolConfig = rawUrl
    .replace(/^mysql:\/\//, "mariadb://")
    + (rawUrl.includes("?") ? "&" : "?")
    + "allowPublicKeyRetrieval=true&charset=utf8mb4";
}

const adapter = new PrismaMariaDb(poolConfig);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
