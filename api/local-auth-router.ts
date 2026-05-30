import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { admins } from "@db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "hgreg-trucks-local-auth-secret-key-2024"
);

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + s).digest("hex");
  return { hash: `${s}:${hash}`, salt: s };
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, _] = stored.split(":");
  const { hash } = hashPassword(password, salt);
  return hash === stored;
}

async function createToken(adminId: number, username: string, role: string): Promise<string> {
  return new SignJWT({ sub: String(adminId), username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

// Read token from header (frontend sends in x-auth-token)
function getTokenFromRequest(req: Request): string | null {
  // Try header first (preferred)
  const headerToken = req.headers.get("x-auth-token");
  if (headerToken) return headerToken;
  // Fallback to cookie
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/local_auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function getCurrentUser(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return { id: Number(payload.sub), username: payload.username as string, role: payload.role as string };
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  login: publicQuery
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(admins).where(eq(admins.username, input.username));
      const admin = result[0];

      if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
        return { success: false, error: "Invalid username or password" };
      }

      const token = await createToken(admin.id, admin.username, admin.role);

      // Return token in body (frontend stores in localStorage)
      return { success: true, username: admin.username, role: admin.role, token };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.req);
    if (!user) return { authenticated: false };
    return { authenticated: true, username: user.username, role: user.role };
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const cookie = `local_auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
    ctx.resHeaders.set("Set-Cookie", cookie);
    return { success: true };
  }),

  // List all users (admin only)
  listUsers: publicQuery.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.req);
    if (!user || user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
    }
    const db = getDb();
    return db.select({ id: admins.id, username: admins.username, role: admins.role, createdAt: admins.createdAt }).from(admins);
  }),

  // Create new user (admin only)
  createUser: publicQuery
    .input(z.object({
      username: z.string().min(3).max(100),
      password: z.string().min(6),
      role: z.enum(["admin", "manager"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const currentUser = await getCurrentUser(ctx.req);
      if (!currentUser || currentUser.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create users" });
      }

      const db = getDb();
      const { hash } = hashPassword(input.password);
      try {
        await db.insert(admins).values({
          username: input.username,
          passwordHash: hash,
          role: input.role,
        });
        return { success: true };
      } catch (e: any) {
        if (e.message?.includes("Duplicate") || e.message?.includes("unique")) {
          return { success: false, error: "Username already exists" };
        }
        return { success: false, error: e.message };
      }
    }),

  // Delete user (admin only, cannot delete self)
  deleteUser: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const currentUser = await getCurrentUser(ctx.req);
      if (!currentUser || currentUser.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      if (currentUser.id === input.id) {
        return { success: false, error: "Cannot delete yourself" };
      }
      const db = getDb();
      await db.delete(admins).where(eq(admins.id, input.id));
      return { success: true };
    }),
});

// Seed default admin on first run
export async function seedDefaultAdmin() {
  try {
    const db = getDb();
    const existing = await db.select().from(admins).where(eq(admins.username, "admin"));
    if (existing.length === 0) {
      const { hash } = hashPassword("admin123");
      await db.insert(admins).values({ username: "admin", passwordHash: hash, role: "admin" });
      console.log("[auth] Default admin created: username=admin, password=admin123, role=admin");
    }
  } catch (e: any) {
    console.error("[auth] Failed to seed admin:", e.message);
  }
}
