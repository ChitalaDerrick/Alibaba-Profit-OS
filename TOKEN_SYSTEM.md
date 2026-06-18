# Token System Implementation - Paystack Integration

## Overview

Your Product Imports Profit Calculator now features a **token-based payment system** powered by Paystack. Users get 10 free starter tokens and can purchase token packages to continue using the app.

## System Architecture

### Token Model
- **1 token = 1 calculation**
- Free users start with **10 tokens**
- Tokens are charged per profit calculation

### Token Packages (Configurable)
- **Starter Pack**: 50 tokens = KES 250
- **Standard Pack**: 100 tokens = KES 500
- **Pro Pack**: 300 tokens = KES 1,400 (5% discount)
- **Enterprise Pack**: 1,000 tokens = KES 4,000 (10% discount)

## Features Implemented

### Database
- `subscriptions.token_balance` - Current token balance
- `token_packages` - Available packages (admin configurable)
- `token_transactions` - Full audit trail of all token movements
- `paystack_webhooks` - Payment verification and idempotency

### API Routes

#### `/api/tokens/purchase` (POST)
Initialize a Paystack payment for tokens
```
Request: { packageId: "uuid" }
Response: { authorization_url, access_code, reference }
```

#### `/api/tokens/callback` (GET)
Paystack callback handler - verifies payment and adds tokens
```
Query: ?reference=<paystack_ref>
Redirects to /tokens/success or /tokens/error
```

#### `/api/tokens/balance` (GET)
Get user's current token balance and transaction history
```
Response: { balance, lifetime_purchased, recent_transactions }
```

#### `/api/tokens/packages` (GET)
Get all available token packages
```
Response: { packages: [...] }
```

#### `/api/calculate` (POST)
Perform calculation - deducts 1 token automatically
```
Response: 402 Payment Required (if no tokens)
Response: 200 OK (successful with token deducted)
```

### Frontend Components

#### `TokenBalance` Component
Displays current token balance in navbar with live polling (5s interval)
- Shows warning color when tokens < 5
- Real-time sync with server

#### `TokenPurchaseModal` Component
Modal for purchasing tokens via Paystack
- Shows all token packages with savings/discounts
- Redirects to Paystack checkout on purchase
- Handles loading states

#### Success/Error Pages
- `/tokens/success` - Shows after successful payment with token amount
- `/tokens/error` - Shows if payment fails or webhook fails

### Security Features

1. **Server-Side Token Deduction**
   - Tokens deducted AFTER calculation confirmed
   - Automatic idempotency with transaction logging
   - No client-side token manipulation possible

2. **Webhook Verification**
   - Paystack signature verification on all webhooks
   - Idempotency check prevents duplicate token additions
   - Full audit trail in `token_transactions` table

3. **RLS Protection**
   - Users can only see their own token transactions
   - Subscriptions protected by RLS policy
   - Database-level security enforcement

4. **Rate Limiting Ready**
   - Can add rate limiting per user per hour
   - Webhook processing includes error logging
   - All transactions timestamped for audit

## Environment Variables Required

Add these to your project:

```
PAYSTACK_SECRET_KEY=<your_paystack_secret_key>
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<your_paystack_public_key>
NEXT_PUBLIC_APP_URL=<your_app_url> # e.g., https://app.example.com
```

Get your keys from: https://dashboard.paystack.co/settings/developer

## Testing Workflow

### Test with Free Tokens
1. New users automatically get 10 starter tokens
2. Perform calculations to see tokens decrease
3. When tokens = 0, "Buy Tokens" button appears

### Test Paystack Payment (Sandbox)
1. Click "Buy Tokens" button
2. Use Paystack test card: 4084084084084081
3. Any future date, any CVV (111)
4. Should redirect to success page with tokens added

### Test Token Deduction
1. After successful payment, check navbar token balance
2. Perform a calculation - should deduct 1 token
3. Check `/api/tokens/balance` - transaction should appear in history

## Database Queries

### Check User's Token Balance
```sql
SELECT token_balance, lifetime_tokens_purchased 
FROM subscriptions 
WHERE user_id = '<user_id>';
```

### View Token Transactions
```sql
SELECT * FROM token_transactions 
WHERE user_id = '<user_id>' 
ORDER BY created_at DESC;
```

### Update Token Packages (Admin)
```sql
UPDATE token_packages 
SET price_kes = 600 
WHERE name = 'Standard Pack';
```

## Production Checklist

- [ ] Add Paystack secret keys to production env vars
- [ ] Set correct `NEXT_PUBLIC_APP_URL` for production domain
- [ ] Enable Paystack webhook in dashboard: `POST /api/tokens/webhook`
- [ ] Test with live Paystack account in test mode first
- [ ] Monitor `token_transactions` and `paystack_webhooks` tables
- [ ] Set up alerts for failed webhook processing
- [ ] Configure custom token packages as needed

## Future Enhancements

1. **Recurring Billing** - Monthly subscription with token allowance
2. **Referral Bonus** - Award tokens for referrals
3. **Token Expiration** - Expire old tokens after 6 months
4. **Usage Analytics** - Dashboard showing token usage trends
5. **Admin Panel** - Manage users, grant tokens, view analytics
6. **Email Notifications** - Alert when tokens run low

## Support

All token transactions are logged in the database for audit purposes. Contact support with user ID for token issues.
