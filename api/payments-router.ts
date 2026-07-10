import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

// Stripe PaymentIntent
const createPaymentIntent = publicQuery.input(
  z.object({
    amount: z.number().min(1),
    currency: z.string().default("usd"),
  })
).mutation(async ({ input }) => {
  try {
    const { default: Stripe } = await import("stripe");
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { source: "hgreg-trucks-parts" },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error("[Stripe] Error creating PaymentIntent:", error.message);
    throw new Error("Failed to create payment intent: " + error.message);
  }
});

// PayPal — create order
const createPayPalOrder = publicQuery.input(
  z.object({
    amount: z.number().min(0.01),
    currency: z.string().default("USD"),
  })
).mutation(async ({ input }) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
    const isSandbox = !process.env.PAYPAL_LIVE;
    const baseUrl = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    if (!authRes.ok) throw new Error(`PayPal auth failed: ${authRes.status}`);

    const authData = await authRes.json();
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.access_token}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: input.currency,
            value: input.amount.toFixed(2),
          },
          description: "HGreg Trucks Parts Order",
        }],
        application_context: {
          brand_name: "HGreg Trucks Parts",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!orderRes.ok) throw new Error(`PayPal order creation failed: ${orderRes.status}`);

    const orderData = await orderRes.json();
    return { orderId: orderData.id, status: orderData.status };
  } catch (error: any) {
    console.error("[PayPal] Error creating order:", error.message);
    throw new Error("Failed to create PayPal order: " + error.message);
  }
});

// PayPal — capture order
const capturePayPalOrder = publicQuery.input(
  z.object({ orderId: z.string() })
).mutation(async ({ input }) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
    const isSandbox = !process.env.PAYPAL_LIVE;
    const baseUrl = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();

    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${input.orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.access_token}`,
          "Prefer": "return=representation",
        },
      }
    );

    if (!captureRes.ok) throw new Error(`PayPal capture failed: ${captureRes.status}`);

    const captureData = await captureRes.json();
    return {
      status: captureData.status,
      captureId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
    };
  } catch (error: any) {
    console.error("[PayPal] Error capturing order:", error.message);
    throw new Error("Failed to capture PayPal payment: " + error.message);
  }
});

// Create order (for all payment methods)
const createOrder = publicQuery.input(
  z.object({
    items: z.array(z.object({
      partId: z.number(),
      quantity: z.number().min(1),
      price: z.string(),
      name: z.string(),
    })),
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    shippingAddress: z.string().optional(),
    paymentMethod: z.enum(["stripe", "paypal", "bank_transfer", "cash_on_pickup"]),
    subtotal: z.number(),
    tax: z.number().default(0),
    shipping: z.number().default(0),
    total: z.number(),
    paypalOrderId: z.string().optional(),
    stripePaymentIntentId: z.string().optional(),
    notes: z.string().optional(),
  })
).mutation(async ({ input }) => {
  try {
    // Here you would save to database
    // For now, return a mock order ID
    const orderId = `HGP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Log order for admin notification
    console.log("[Order Created]", {
      orderId,
      method: input.paymentMethod,
      total: input.total,
      customer: input.customerEmail,
    });

    // Return different instructions based on payment method
    const instructions: Record<string, string> = {
      stripe: "Payment processed successfully via Stripe.",
      paypal: "Payment processed successfully via PayPal.",
      bank_transfer: `Please transfer $${input.total.toFixed(2)} to:\n\nAccount: HGreg Trucks Parts\nBank: [Your Bank Name]\nAccount #: [Your Account Number]\nRouting #: [Your Routing Number]\n\nReference: ${orderId}\n\nYour order will be processed once payment is confirmed.`,
      cash_on_pickup: `Your order #${orderId} is confirmed.\n\nPlease pay $${input.total.toFixed(2)} in cash when you pick up your order at:\n\nHGreg Trucks Parts\n[Your Miami Warehouse Address]\n\nBusiness Hours: Mon-Fri 8AM-5PM, Sat 8AM-12PM\n\nBring a valid ID and your order number.`,
    };

    return {
      orderId,
      status: input.paymentMethod === "bank_transfer" ? "pending_payment" : "confirmed",
      instructions: instructions[input.paymentMethod],
      paymentMethod: input.paymentMethod,
    };
  } catch (error: any) {
    console.error("[Order] Error creating order:", error.message);
    throw new Error("Failed to create order: " + error.message);
  }
});

// Stripe Checkout Session — redirects user to Stripe to pay
const createStripeCheckoutSession = publicQuery.input(
  z.object({
    items: z.array(z.object({
      name: z.string(),
      price: z.number().min(0.01),
      quantity: z.number().min(1),
      image: z.string().optional(),
    })),
    customerEmail: z.string().email().optional(),
    orderId: z.string(),
  })
).mutation(async ({ input }) => {
  try {
    const { default: Stripe } = await import("stripe");
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: input.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "https://hgregtrucksparts.com"}/#/checkout/success?order=${input.orderId}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "https://hgregtrucksparts.com"}/#/checkout?canceled=true`,
      customer_email: input.customerEmail,
      metadata: {
        orderId: input.orderId,
        source: "hgreg-trucks-parts",
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error: any) {
    console.error("[Stripe] Error creating checkout session:", error.message);
    throw new Error("Failed to create Stripe checkout: " + error.message);
  }
});

// Verify Stripe checkout session
const verifyStripeSession = publicQuery.input(
  z.object({ sessionId: z.string() })
).query(async ({ input }) => {
  try {
    const { default: Stripe } = await import("stripe");
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const session = await stripe.checkout.sessions.retrieve(input.sessionId);
    return {
      status: session.payment_status, // "paid", "unpaid", "no_payment_required"
      amountTotal: session.amount_total,
      customerEmail: session.customer_email,
      orderId: session.metadata?.orderId,
    };
  } catch (error: any) {
    throw new Error("Failed to verify session: " + error.message);
  }
});

// Get public config (publishable keys, client IDs)
const getPublicConfig = publicQuery.query(() => {
  return {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
  };
});

export const paymentsRouter = createRouter({
  getPublicConfig,
  createPaymentIntent,
  createStripeCheckoutSession,
  verifyStripeSession,
  createPayPalOrder,
  capturePayPalOrder,
  createOrder,
});
