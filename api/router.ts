import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { partsRouter } from "./parts-router";
import { messagesRouter } from "./messages-router";
import { paymentsRouter } from "./payments-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  parts: partsRouter,
  messages: messagesRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
