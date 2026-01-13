# QUICK FIX - JWT_SECRET Issue on Vercel

## The Problem (Confirmed from logs)

Your login succeeds and sets a cookie, but the middleware can't verify it because **JWT_SECRET mismatch**.

## Immediate Actions

### 1. Check Your JWT_SECRET on Vercel

Visit this URL in your browser:

```
https://whatsmind.vercel.app/api/debug/env
```

This will show you:

- First 10 characters of your JWT_SECRET
- Whether it's using the default value (BAD!)
- Secret length
- Other environment variable status

**Expected:**

```json
{
  "secretPreview": "xk2Hd8p9L...", // Your actual secret
  "secretLength": 64, // Should be > 32
  "isDefault": false, // MUST be false!
  "nodeEnv": "production",
  "hasMongoUri": true,
  "hasNextAuthSecret": true
}
```

**If `isDefault: true`** → JWT_SECRET is NOT set on Vercel!

### 2. Check Vercel Logs After Next Login

After you deploy the updated code, try logging in again and check logs for:

```
[Login] JWT_SECRET being used: xk2Hd8p9L...
[Middleware] Token verification failed: invalid signature
[Middleware] JWT_SECRET being used: your-secre...
```

If the JWT_SECRET preview is different between login and middleware → **CONFIRMED MISMATCH**

### 3. Fix on Vercel

1. Go to: https://vercel.com/twist-digital/whatsmind/settings/environment-variables
2. Find or Add: `JWT_SECRET`
3. Set the value to a strong secret (minimum 32 characters)
4. **IMPORTANT**: Apply to all environments (Production, Preview, Development)
5. Click Save
6. Redeploy your application

### 4. Generate a Strong Secret

Run this locally to generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your JWT_SECRET on Vercel.

### 5. Verify the Fix

After redeploying:

1. Visit: `https://whatsmind.vercel.app/api/debug/env`
2. Confirm `isDefault: false`
3. Try logging in
4. Check logs - should see:
   ```
   [Login] JWT_SECRET being used: xk2Hd8p9L...
   [Middleware] Valid token for: admin@example.com - Role: Admin
   ```

## Why This Happened

- **Locally**: Your `.env.local` file has JWT_SECRET set correctly
- **Vercel**: JWT_SECRET was never set, so it uses the default value
- **Result**: Token signed with one secret, verified with different secret → fails

## Environment Variables Checklist for Vercel

Make sure these are ALL set on Vercel:

```
✓ JWT_SECRET=<your-strong-secret-here>
✓ MONGODB_URI=<your-mongodb-connection-string>
✓ NEXTAUTH_SECRET=<same-as-jwt-secret-or-crm-secret>
✓ NODE_ENV=production (usually auto-set by Vercel)
```

## After Fixing

Once JWT_SECRET is correctly set on Vercel and redeployed:

1. Clear browser cookies
2. Try logging in
3. Should work immediately!

---

**Delete the debug endpoint after fixing for security:**

```bash
rm app/api/debug/env/route.ts
```
