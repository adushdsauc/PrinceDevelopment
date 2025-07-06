import express from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import dotenv from 'dotenv';


dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const paymentSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema, 'payments');

app.post('/create-checkout-session', async (req, res) => {
  const { title, amount, userId } = req.body;
  if (!title || !amount || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: title },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { userId, title },
      success_url: `${process.env.PUBLIC_URL}/success`,
      cancel_url: `${process.env.PUBLIC_URL}/cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const payment = new Payment({
      userId: session.metadata.userId,
      title: session.metadata.title || 'Unknown',
      amount: session.amount_total / 100,
      stripeSessionId: session.id,
    });
    payment.save().catch(console.error);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
