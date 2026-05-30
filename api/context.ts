import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { jwtVerify } from "jose";

const LOCAL_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "hgreg-trucks-local-auth-secret-key-2024"
);

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try Kimi OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Kimi auth failed, try local JWT
  }

  // If no user from Kimi, try local auth token from header or cookie
  if (!ctx.user) {
    try {
      // Try header first
      let token = opts.req.headers.get("x-auth-token");
      // If not in header, try cookie
      if (!token) {
        const cookieHeader = opts.req.headers.get("cookie") || "";
        const match = cookieHeader.match(/local_auth_token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
      if (token) {
        const { payload } = await jwtVerify(token, LOCAL_SECRET, { clockTolerance: 60 });
        // Create a User-like object from local auth token for admin middleware
        ctx.user = {
          id: Number(payload.sub) || 0,
          unionId: payload.sub as string || "",
          name: payload.username as string || "",
          email: null,
          avatar: "",
          role: (payload.role === "admin" ? "admin" : "user") as "admin" | "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignInAt: new Date(),
        };
      }
    } catch {
      // Local auth also failed, user stays undefined
    }
  }

  return ctx;
}
