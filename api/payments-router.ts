import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

// Stripe PaymentIntent
const createPaymentIntent = publicQuery.input(
  z.object({
    amount: z.number().min(1), // amount in cents
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
      metadata: {
        source: "hgreg-trucks-parts",
      },
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

    // Get access token
    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    if (!authRes.ok) {
      throw new Error(`PayPal auth failed: ${authRes.status}`);
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // Create order
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: input.currency,
              value: input.amount.toFixed(2),
            },
            description: "HGreg Trucks Parts Order",
          },
        ],
        application_context: {
          brand_name: "HGreg Trucks Parts",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
        },
      }),
    });

    if (!orderRes.ok) {
      throw new Error(`PayPal order creation failed: ${orderRes.status}`);
    }

    const orderData = await orderRes.json();
    return { orderId: orderData.id, status: orderData.status };
  } catch (error: any) {
    console.error("[PayPal] Error creating order:", error.message);
    throw new Error("Failed to create PayPal order: " + error.message);
  }
});

// PayPal — capture order
const capturePayPalOrder = publicQuery.input(
  z.object({
    orderId: z.string(),
  })
).mutation(async ({ input }) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID || "";
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
    const isSandbox = !process.env.PAYPAL_LIVE;
    const baseUrl = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    // Get access token
    const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // Capture order
    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${input.orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Prefer": "return=representation",
        },
      }
    );

    if (!captureRes.ok) {
      throw new Error(`PayPal capture failed: ${captureRes.status}`);
    }

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
  createPayPalOrder,
  capturePayPalOrder,
});
