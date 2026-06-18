# Free Tokens for Trial Usage

## Overview
Every new user gets **10 free starter tokens** automatically when they sign up. This allows them to try the app before purchasing more tokens.

## How It Works

### 1. **Automatic Signup Grant** (Database Trigger)
When a user creates a Supabase account:
- A trigger fires (`handle_new_user_signup`)
- Automatically creates a subscription record with `token_balance = 10`
- Logs the grant in `token_transactions` table for audit purposes

### 2. **Fallback Grant** (API)
If the trigger doesn't fire for any reason:
- The `/api/subscription` endpoint checks for an existing subscription
- If none exists, it creates one with 10 tokens
- This ensures users always have tokens even if the trigger fails

### 3. **Token Transaction Log**
Every token action is tracked:
- `admin_grant` - Free tokens given to new users
- `calculation` - 1 token spent per calculation
- `purchase` - Tokens bought via Paystack
- `refund` - Refunds if payment fails

## Free Token Benefits
Users can:
- ✅ Make 10 profit calculations
- ✅ Test the calculator interface
- ✅ Experience the UI/UX
- ✅ See token purchase options

## Token Packages (Paid)
After free tokens run out, users can buy:
- **Starter Pack**: 50 tokens for 250 KES
- **Standard Pack**: 100 tokens for 500 KES
- **Pro Pack**: 300 tokens for 1,400 KES (5% discount)
- **Enterprise Pack**: 1,000 tokens for 4,000 KES (10% discount)

## Implementation Details

### Database Trigger
```sql
-- Located in Supabase
-- File: handle_new_user_signup()
-- Runs AFTER INSERT on auth.users
-- Creates subscription + logs transaction
```

### API Endpoints
```
GET /api/subscription        - Check token balance
GET /api/tokens/balance      - Get current balance
GET /api/tokens/packages     - List available packages
POST /api/tokens/purchase    - Initiate Paystack payment
GET /api/tokens/callback     - Handle payment confirmation
```

### Frontend Components
```
TokenBalance          - Display current tokens in navbar
TokenPurchaseModal    - UI for buying token packages
PaywallModal          - Show when out of tokens
```

## Testing the Free Tokens

1. **Sign up** with a new account
2. **Check navbar** - Should show "10 tokens available"
3. **Make calculations** - Each one costs 1 token
4. **Run out** - After 10 calculations, modal opens to buy more
5. **Purchase** - Click "Buy Tokens" → Paystack payment

## Database Schema Changes
- `subscriptions.token_balance` - Current tokens (default: 10)
- `token_packages` - Available packages for purchase
- `token_transactions` - Audit log of all token movements
- Trigger: `on_auth_user_created_tokens` - Auto-grant on signup
