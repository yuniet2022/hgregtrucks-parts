import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { partsRouter } from "./parts-router";
import { variantsRouter } from "./variants-router";
import { messagesRouter } from "./messages-router";
import { paymentsRouter } from "./payments-router";
import { fullbayRouter } from "./fullbay-router";
import { ordersRouter } from "./orders-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  parts: partsRouter,
  variants: variantsRouter,
  messages: messagesRouter,
  payments: paymentsRouter,
  fullbay: fullbayRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;


