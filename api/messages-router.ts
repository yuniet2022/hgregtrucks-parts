import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "hgreg-trucks-local-auth-secret-key-2024"
);

function getTokenFromRequest(req: Request): string | null {
  const headerToken = req.headers.get("x-auth-token");
  if (headerToken) return headerToken;
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

export const messagesRouter = createRouter({
  // Submit message (public - no auth required)
  create: publicQuery
    .input(z.object({
      name: z.string().min(1).max(255),
      email: z.string().email(),
      subject: z.string().min(1).max(255),
      body: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(messages).values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        body: input.body,
      });
      return { success: true };
    }),

  // List all messages (admin/manager only)
  list: publicQuery.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.req);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin or Manager only" });
    }
    const db = getDb();
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }),

  // Count new messages (admin/manager only)
  countNew: publicQuery.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.req);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return { count: 0 };
    }
    const db = getDb();
    const result = await db.select({ value: count() }).from(messages).where(eq(messages.status, "new"));
    return { count: result[0]?.value ?? 0 };
  }),

  // Respond to a message (admin/manager only)
  respond: publicQuery
    .input(z.object({
      id: z.number(),
      response: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getCurrentUser(ctx.req);
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin or Manager only" });
      }
      const db = getDb();
      await db.update(messages)
        .set({
          status: "answered",
          response: input.response,
          respondedBy: user.username,
          respondedAt: new Date(),
        })
        .where(eq(messages.id, input.id));
      return { success: true };
    }),
});
