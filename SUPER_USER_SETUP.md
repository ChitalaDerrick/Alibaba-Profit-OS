/**
 * Super User Setup Guide
 * 
 * To make your account a super user with no restrictions:
 * 
 * 1. Sign up/login with your account on the app
 * 2. Go to your Supabase dashboard
 * 3. Navigate to: Authentication > Users
 * 4. Copy your user ID (UUID format)
 * 5. Go to SQL Editor in Supabase
 * 6. Run this query:
 * 
 * INSERT INTO public.super_users (user_id, email, notes)
 * VALUES ('YOUR_USER_ID_HERE', 'your@email.com', 'App Owner');
 * 
 * Replace 'YOUR_USER_ID_HERE' with your actual Supabase user ID
 * 
 * After that:
 * - Refresh the app
 * - Your navbar should show "Super User" badge (purple with crown)
 * - You'll have access to all tabs and features without any restrictions
 * - No subscription needed
 */

// Alternatively, you can use this API endpoint to check if you're a super user:
// GET /api/super-user/check?userId=YOUR_USER_ID
