# Vercel Deployment - Cookie Authentication Troubleshooting Guide

## Problem Description
Login succeeds with "success message" but redirects back to login page. Works fine locally but fails on Vercel.

## Root Causes

### 1. **JWT_SECRET Mismatch**
The most common issue is that the `JWT_SECRET` environment variable is not set correctly on Vercel.

**Solution:**
1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Add/Update the following variables:
   ```
   JWT_SECRET=<your-secret-key>
   NEXTAUTH_SECRET=<same-as-crm-or-your-secret-key>
   MONGODB_URI=<your-mongodb-connection-string>
   NODE_ENV=production
   ```
4. **CRITICAL**: The `JWT_SECRET` must be the SAME value locally and on Vercel
5. After updating, **redeploy your application**

### 2. **Cookie Security Settings**
Vercel uses HTTPS in production, which requires proper cookie security configuration.

**Fixed in the code:**
- ✅ Added `path: "/"` to ensure cookie is available site-wide
- ✅ Set `secure: true` only in production (HTTPS required)
- ✅ Using `sameSite: "lax"` for proper redirect handling
- ✅ Added explicit typing for cookie options

### 3. **MongoDB Connection Issues**
If the MongoDB connection fails on Vercel, user lookup will fail silently.

**Solution:**
1. Verify your MongoDB URI is correct in Vercel environment variables
2. Ensure your MongoDB allows connections from Vercel's IP addresses
3. Check Vercel function logs for connection errors

## Debugging Steps

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Go to the "Functions" tab
4. Look for logs from these endpoints:
   - `/api/auth/login` - Login attempt
   - `/api/auth/verify` - Token verification
   - Middleware logs

**What to look for:**
```
[Login] Attempting login for: user@example.com
[Login] Login successful for: user@example.com - Role: Admin
[Login] Setting cookie with options: {...}
```

If you see these logs, login is working. If not, check:
- MongoDB connection
- User exists in database
- User role is "Admin"
- User status is "Enabled"

### Step 2: Check Cookie in Browser
1. Open your Vercel site
2. Try to login
3. Open Browser DevTools (F12)
4. Go to: Application → Cookies → Your Vercel domain
5. Check if `token` cookie exists with these attributes:
   - **Path**: `/`
   - **HttpOnly**: ✓ (checked)
   - **Secure**: ✓ (checked in production)
   - **SameSite**: `Lax`

**If cookie is missing:**
- Check Vercel logs for errors
- Verify JWT_SECRET is set
- Check if MongoDB connection succeeds

**If cookie exists but still redirected to login:**
- The middleware might not be reading it correctly
- Check middleware logs in Vercel function logs

### Step 3: Test Token Verification
After successful login, manually test the verify endpoint:

```bash
# Get the cookie value from DevTools
curl -X GET https://your-app.vercel.app/api/auth/verify \
  -H "Cookie: token=YOUR_TOKEN_VALUE_HERE" \
  -v
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "Admin",
    "name": "..."
  }
}
```

If this fails, the JWT_SECRET on Vercel doesn't match the one used to create the token.

## Quick Fix Checklist

- [ ] Set `JWT_SECRET` in Vercel environment variables
- [ ] Set `MONGODB_URI` in Vercel environment variables
- [ ] Set `NEXTAUTH_SECRET` in Vercel environment variables (same as JWT_SECRET if not using CRM)
- [ ] Verify JWT_SECRET matches between local and Vercel
- [ ] Redeploy after setting environment variables
- [ ] Clear browser cookies and try again
- [ ] Check Vercel function logs for errors
- [ ] Verify MongoDB allows Vercel IP connections
- [ ] Confirm user exists with role="Admin" and status="Enabled"

## Common Errors and Solutions

### "Invalid token" in logs
**Cause:** JWT_SECRET mismatch
**Solution:** Ensure JWT_SECRET is the same in both environments

### "No token provided" in verify endpoint
**Cause:** Cookie not being set or sent
**Solution:** Check browser cookies, verify cookie attributes are correct

### "Access denied. Only Admin users..."
**Cause:** User role is not "Admin"
**Solution:** Update user role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "Admin", status: "Enabled" } }
)
```

### Login succeeds but immediately redirects back
**Cause:** Middleware not reading cookie OR cookie not being set
**Solution:** 
1. Check browser DevTools → Network tab
2. Look at the login response headers
3. Verify `Set-Cookie` header is present
4. Check middleware logs to see if it's detecting the cookie

## Testing on Vercel

After deploying with the fixes:

1. **Clear all browser data** for your Vercel domain
2. Open an incognito/private window
3. Navigate to your Vercel URL
4. Open DevTools → Network tab
5. Try to login
6. Watch the network requests:
   - Login request should return 200 with user data
   - Response should have `Set-Cookie` header
   - Redirect to `/` should include the cookie
   - Middleware should allow access

## Additional Environment Variables

Make sure ALL required environment variables are set on Vercel:

```bash
# Required
JWT_SECRET=<your-secret>
MONGODB_URI=<your-mongodb-uri>
NODE_ENV=production

# For CRM Integration (if applicable)
NEXTAUTH_SECRET=<same-as-crm>

# For WhatsApp (if configured)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=<your-id>
WHATSAPP_ACCESS_TOKEN=<your-token>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<your-verify-token>
```

## Need More Help?

If the issue persists after following this guide:

1. Share the Vercel function logs (from the Functions tab)
2. Share the browser console errors (if any)
3. Share the Network tab for the login request (redact sensitive data)
4. Verify the user exists in MongoDB with the correct role and status

## Code Changes Made

The following files were updated to fix cookie authentication issues:

1. **`app/api/auth/login/route.ts`**
   - Added extensive logging
   - Fixed cookie configuration with explicit path and typing
   - Added production/development environment detection

2. **`middleware.ts`**
   - Added logging to track cookie detection
   - Added debug logs for auth flow

3. **`app/api/auth/verify/route.ts`**
   - Added logging for token verification

4. **`app/src/pages/Login.tsx`**
   - Increased redirect delay to ensure cookie is set
   - Better error handling

All changes are backward compatible and work in both development and production.
