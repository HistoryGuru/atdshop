require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS: allow your GitHub Pages domain ──────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,          // e.g. https://yourusername.github.io
  'http://localhost:5500',            // live-server local dev
  'http://127.0.0.1:5500'
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  }
}));

// Raw body for Stripe webhooks MUST come before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

// ── PRICE MAP (server-side source of truth) ───────────────
// Define your Stripe Price IDs here after creating products in Stripe dashboard
// OR use inline price_data (simpler for MVP — shown below)
const PRODUCT = {
  name:        'GRIPLOCK PRO Grip Socks',
  price_pence: 1899,   // £18.99 in pence
  currency:    'gbp',
  image:       process.env.PRODUCT_IMAGE_URL || ''
};

// ── POST /create-checkout-session ─────────────────────────
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Build Stripe line items from cart
    const lineItems = items.map(item => ({
      price_data: {
        currency:     PRODUCT.currency,
        unit_amount:  Math.round(item.price * 100),   // convert to pence
        product_data: {
          name:        `${PRODUCT.name} — ${item.color.toUpperCase()} / Size ${item.size}`,
          description: 'Anti-slip grip nodes. Pro-grade fabric. Built for the pitch.',
          ...(PRODUCT.image ? { images: [PRODUCT.image] } : {})
        }
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:           lineItems,
      mode:                 'payment',
      success_url:          `${process.env.FRONTEND_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:           `${process.env.FRONTEND_URL}/index.html`,
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'US', 'CA', 'AU']
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type:         'fixed_amount',
            fixed_amount: { amount: 299, currency: 'gbp' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 }
            }
          }
        },
        {
          shipping_rate_data: {
            type:         'fixed_amount',
            fixed_amount: { amount: 0, currency: 'gbp' },
            display_name: 'Free Shipping (orders over £40)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ]
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

// ── POST /subscribe (email newsletter) ───────────────────
// Simple in-memory store for MVP. Replace with Mailchimp/Klaviyo API call.
const subscribers = new Set();

app.post('/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  subscribers.add(email.toLowerCase().trim());
  console.log(`New subscriber: ${email} (total: ${subscribers.size})`);
  // TODO: forward to your email provider (Mailchimp, Klaviyo, etc.)
  res.json({ success: true });
});

// ── STRIPE WEBHOOK ─────────────────────────────────────────
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(`Payment received! Session: ${session.id}, Amount: ${session.amount_total / 100} ${session.currency.toUpperCase()}`);
    // TODO: fulfil order — send confirmation email, update inventory, etc.
  }

  res.json({ received: true });
}

// ── HEALTH CHECK ──────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.listen(PORT, () => console.log(`GRIPLOCK backend running on port ${PORT}`));
