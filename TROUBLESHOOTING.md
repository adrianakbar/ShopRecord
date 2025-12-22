# Troubleshooting: No Data in History Page

## Problem
History page shows no data even though database has records.

## Root Cause
The user ID in the seed data doesn't match the logged-in user's ID.

## Solutions

### Solution 1: Development Mode (Quick Fix) ✅
The API now automatically uses mock user data in development mode when no user is logged in.

**Status:** Already implemented!
- In development, if not logged in, API uses mock user ID: `00000000-0000-0000-0000-000000000001`
- Just refresh the history page and data should appear

### Solution 2: Seed with Your Real User ID (Production Ready)

1. **Login to the app:**
   - Visit `http://localhost:3000`
   - Sign up or log in

2. **Check your user ID:**
   ```bash
   curl http://localhost:3000/api/debug/user | jq .userId
   ```

3. **Seed database with your user ID:**
   ```bash
   USER_ID="<your-user-id-from-step-2>" npm run db:seed:real
   ```

   Example:
   ```bash
   USER_ID="a1b2c3d4-5678-90ab-cdef-1234567890ab" npm run db:seed:real
   ```

4. **Refresh history page** - data should now appear!

### Solution 3: Use Mock User for Testing

If you want to test with the mock user:

1. **Seed with mock user** (already done):
   ```bash
   npm run db:seed
   ```

2. **Development mode automatically handles this** - no login required in dev!

## Verification

### Check if API works:
```bash
curl http://localhost:3000/api/debug/user
curl http://localhost:3000/api/expenses | jq
```

### Check database:
```bash
npx tsx scripts/check-db.ts
```

## How It Works

- **Development Mode:** Uses mock user ID if not authenticated
- **Production Mode:** Requires real authentication
- **Middleware:** `/history` route is protected by auth middleware
- **Database:** Expenses are user-specific (filtered by `userId`)

## Notes

- In development, authentication is relaxed for easier testing
- In production, all routes require proper Supabase authentication
- Each user only sees their own expenses
- Seed script creates categories and expenses for specified user ID
