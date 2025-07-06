# PrinceDevelopment

This repository provides a simple example of an Express backend integrated with Stripe and a small Discord bot. The backend exposes endpoints to create a checkout session and handle Stripe webhooks. The Discord bot sends an embed with a button that redirects the user to the checkout URL returned from the backend.

## Setup

1. Copy `.env.example` to `.env` and fill in the required environment variables.
2. Install dependencies with `npm install` (requires internet access).
3. Start the backend with `node backend/index.js`.
4. Start the Discord bot with `node bot/index.js`.

## Environment variables

```
PORT=3000
PUBLIC_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=mongodb://localhost:27017/payments
BACKEND_URL=http://localhost:3000
DISCORD_TOKEN=your_bot_token
```
