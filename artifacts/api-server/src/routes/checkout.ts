import { Router } from "express";
import { stripe } from "../stripeClient";

const router = Router();

const ROAD_WORKOUTS_PRICE_ID = "price_1TAmz1ExKk6XaaWgWpTBxlIs";
const ROAD_WORKOUTS_PAYMENT_LINK = "https://buy.stripe.com/test_cNi3cvggre7Y2ISe0ffbq00";

router.post("/checkout/road-workouts", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.json({ url: ROAD_WORKOUTS_PAYMENT_LINK });
  }

  try {
    const origin =
      req.headers.origin ??
      req.headers.referer ??
      "https://m2training.com";

    const session = (await stripe.post("/v1/checkout/sessions", {
      mode: "payment",
      "line_items[0][price]": ROAD_WORKOUTS_PRICE_ID,
      "line_items[0][quantity]": "1",
      success_url: `${origin}/purchase-success`,
      cancel_url: `${origin}/store`,
      "metadata[product]": "workouts_on_the_road",
    })) as { url: string };

    return res.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[checkout] Stripe error:", err);
    return res.json({ url: ROAD_WORKOUTS_PAYMENT_LINK });
  }
});

const PLAN_NAMES: Record<string, { name: string; amount: number }> = {
  standard: { name: "M² Online Coaching – Standard", amount: 10000 },
  full: { name: "M² Online Coaching – Full", amount: 15000 },
  elite: { name: "M² Online Coaching – Elite", amount: 20000 },
};

router.post("/checkout/subscription", async (req, res) => {
  const { plan, clientEmail } = req.body as { plan?: string; clientEmail?: string };

  const planInfo = plan ? PLAN_NAMES[plan] : null;
  if (!planInfo) return res.status(400).json({ error: "Invalid plan" });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe not configured" });
  }

  try {
    const origin = (req.headers.origin ?? req.headers.referer ?? "https://m2training.com") as string;
    const params: Record<string, string> = {
      mode: "subscription",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][recurring][interval]": "month",
      "line_items[0][price_data][product_data][name]": planInfo.name,
      "line_items[0][price_data][unit_amount]": String(planInfo.amount),
      "line_items[0][quantity]": "1",
      success_url: `${origin}/subscription-success`,
      cancel_url: `${origin}/online-coaching`,
    };
    if (clientEmail) params["customer_email"] = clientEmail;

    const session = (await stripe.post("/v1/checkout/sessions", params)) as { url: string };
    return res.json({ url: session.url });
  } catch (err) {
    console.error("[checkout/subscription]", err);
    return res.status(500).json({ error: "Stripe error" });
  }
});

export default router;
