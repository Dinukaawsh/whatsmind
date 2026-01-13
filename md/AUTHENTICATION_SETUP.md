# WhatsMind - CRM Shared Authentication Setup

## Overview

WhatsMind integrates seamlessly with your CRM application using shared authentication. Both applications use the **same MongoDB database**, allowing users who are logged into the CRM to automatically access WhatsMind without re-authentication.

## Key Features

✅ **Single Sign-On (SSO)**: Users logged into CRM are automatically logged into WhatsMind
✅ **Role-Based Access**: Only Admin users from CRM can access WhatsMind
✅ **Separate Sessions**: WhatsMind logout doesn't affect CRM session
✅ **Fallback Login**: Users can login directly with CRM credentials if not logged into CRM
✅ **Shared Database**: Both apps use the same MongoDB database for user management

## Architecture

### CRM Application

- Uses **NextAuth** for session management
- Stores session tokens in cookies: `next-auth.session-token` (dev) or `__Secure-next-auth.session-token` (prod)
- JWT secret stored in `NEXTAUTH_SECRET`

### WhatsMind Application

- Uses **JWT tokens** for authentication
- Stores its own token in `token` cookie
- Can read and verify CRM's NextAuth session tokens
- Shares the same MongoDB database as CRM

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-secure-random-string-min-32-chars

# ============================================
# CRM Integration (NextAuth Session Sharing)
# ============================================
# MUST match the NEXTAUTH_SECRET from your CRM
NEXTAUTH_SECRET=same-secret-as-crm-nextauth-secret

# ============================================
# MongoDB Configuration
# ============================================
# MUST point to the SAME database as your CRM
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=your-crm-database-name
```

### 2. Critical Configuration Points

#### ⚠️ NEXTAUTH_SECRET

This **MUST** match the `NEXTAUTH_SECRET` in your CRM's environment variables. This allows WhatsMind to verify CRM session tokens.

**CRM `.env`:**

```env
NEXTAUTH_SECRET=my-super-secret-key-123
```

**WhatsMind `.env`:**

```env
NEXTAUTH_SECRET=my-super-secret-key-123  # SAME VALUE
```

#### ⚠️ Database Connection

Both applications **MUST** connect to the same MongoDB database and use the same User collection.

**CRM `.env`:**

```env
MONGODB_URI=mongodb://localhost:27017/crm-production
```

**WhatsMind `.env`:**

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=crm-production  # SAME DATABASE
```

### 3. User Model Compatibility

The User model in WhatsMind must match the CRM's User model structure. Required fields:

- `_id` - MongoDB ObjectId
- `email` - User's email address
- `role` - User role (must be "Admin" for WhatsMind access)
- `status` - Account status (must be "Enabled")
- `name` - User's display name
- `password` - Hashed password (for fallback login)

## How It Works

### Authentication Flow

```
┌─────────────────┐         ┌──────────────────┐
│   CRM Login     │         │  WhatsMind Visit │
│  (NextAuth)     │         │                  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│     Browser Cookie Store                    │
│  - next-auth.session-token (CRM)           │
│  - token (WhatsMind - created on demand)   │
└─────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  CRM Session    │         │  WhatsMind Check │
│  Active & Valid │         │  1. Check 'token'│
└─────────────────┘         │  2. Check CRM    │
                            │     session      │
                            │  3. Auto-login   │
                            │     or redirect  │
                            └──────────────────┘
```

### Step-by-Step Process

1. **User logs into CRM**

   - NextAuth creates session token
   - Token stored in browser cookie
   - User can access all CRM features

2. **User navigates to WhatsMind**

   - WhatsMind middleware checks for its own `token` cookie
   - If not found, checks for CRM's `next-auth.session-token`
   - If CRM session exists, allows access to continue

3. **Login page checks CRM session**

   - Frontend calls `/api/auth/sync-crm`
   - Verifies CRM token and user is Admin
   - Creates WhatsMind JWT token
   - User automatically logged in

4. **User interacts with WhatsMind**

   - All API calls use WhatsMind JWT token
   - Token includes userId, email, role

5. **User logs out from WhatsMind**
   - Only WhatsMind `token` is cleared
   - CRM session remains active
   - If user refreshes, auto-login happens again

## API Endpoints

### `/api/auth/sync-crm` (GET)

Syncs CRM session with WhatsMind.

**Request:**

```bash
curl -X GET http://localhost:3000/api/auth/sync-crm \
  -H "Cookie: next-auth.session-token=xxx"
```

**Response (Success):**

```json
{
  "message": "Session synced successfully",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "Admin"
  }
}
```

**Response (Not Admin):**

```json
{
  "error": "Access denied. Only Admin users can access this application."
}
```

### `/api/auth/login` (POST)

Direct login with CRM credentials.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "Admin"
  }
}
```

### `/api/auth/logout` (POST)

Logout from WhatsMind only.

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Response:**

```json
{
  "message": "Logout successful",
  "note": "You have been logged out from this application. If you are logged into CRM, you can access this app again by refreshing the page."
}
```

## User Experience Scenarios

### Scenario 1: Admin User Logged into CRM

1. User is already logged into CRM
2. Opens WhatsMind in new tab
3. **Automatically logged in** - no credentials needed
4. Can use WhatsMind immediately

### Scenario 2: Admin User Not Logged into CRM

1. User opens WhatsMind directly
2. Sees login page
3. Enters CRM admin credentials
4. Logged into WhatsMind
5. Can now use the application

### Scenario 3: Non-Admin User

1. User logs into CRM as non-admin
2. Tries to access WhatsMind
3. **Redirected to unauthorized page**
4. Cannot access WhatsMind features

### Scenario 4: Logout from WhatsMind

1. User clicks logout in WhatsMind
2. WhatsMind token cleared
3. User redirected to login page
4. If still logged into CRM, can click refresh to auto-login
5. Or can enter credentials manually

### Scenario 5: Logout from CRM

1. User logs out from CRM
2. CRM session token cleared
3. If user tries to access WhatsMind, no auto-login
4. Must enter credentials manually

## Security Considerations

### Cookie Security

- **httpOnly**: Prevents JavaScript access to tokens
- **secure**: HTTPS-only in production
- **sameSite**: Protects against CSRF attacks
- **path**: Scoped to application root

### Token Validation

- JWT tokens verified on every request
- Expired tokens rejected
- Invalid signatures rejected
- Role checked on every protected route

### Admin-Only Access

- Middleware enforces admin role
- Database queries verify user status
- Unauthorized users redirected

## Deployment Checklist

### For Both Applications

- [ ] Set identical `NEXTAUTH_SECRET` in both CRM and WhatsMind
- [ ] Point to same MongoDB instance and database
- [ ] Deploy both apps under same parent domain (for cookie sharing)
  - Example: `crm.yourdomain.com` and `whatsmind.yourdomain.com`
- [ ] Or deploy with cookie domain configuration
- [ ] Enable HTTPS in production
- [ ] Set `NODE_ENV=production`

### Cookie Domain Configuration (if needed)

If deploying on different subdomains, you may need to set cookie domain:

**CRM (NextAuth config):**

```typescript
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      domain: '.yourdomain.com', // Note the leading dot
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  }
}
```

**WhatsMind (response.cookies.set):**

```typescript
response.cookies.set("token", token, {
  domain: ".yourdomain.com", // Note the leading dot
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

## Troubleshooting

### Issue: Auto-login not working

**Possible causes:**

- Different `NEXTAUTH_SECRET` values
- Apps on different domains without proper cookie config
- CRM session expired
- User is not an Admin

**Solution:**

1. Verify `NEXTAUTH_SECRET` matches in both apps
2. Check browser cookies - should see `next-auth.session-token`
3. Check user role in database
4. Check browser console for errors

### Issue: "Invalid CRM session" error

**Possible causes:**

- CRM token expired
- Wrong `NEXTAUTH_SECRET`
- Token corrupted

**Solution:**

1. Logout from CRM and login again
2. Verify secret configuration
3. Clear browser cookies and try again

### Issue: "Access denied" message

**Possible causes:**

- User role is not "Admin"
- User status is not "Enabled"

**Solution:**

1. Check user role in MongoDB: `db.users.findOne({email: "user@example.com"})`
2. Update user role: `db.users.updateOne({email: "user@example.com"}, {$set: {role: "Admin"}})`
3. Verify user status is "Enabled"

### Issue: Database connection error

**Possible causes:**

- Different database configured
- MongoDB not running
- Wrong connection string

**Solution:**

1. Verify `MONGODB_URI` and `MONGODB_DATABASE` match CRM settings
2. Test connection: `mongosh "mongodb://localhost:27017/your-database"`
3. Check MongoDB is running: `systemctl status mongod`

## Development vs Production

### Development Setup

- Use `next-auth.session-token` (without `__Secure-` prefix)
- Can use `localhost` for both apps
- HTTP acceptable for local development
- Set `NODE_ENV=development`

### Production Setup

- Cookie name becomes `__Secure-next-auth.session-token`
- Must use HTTPS
- Configure proper domains
- Set `NODE_ENV=production`
- Use strong secrets (minimum 32 characters)

## Testing the Integration

### Test 1: CRM Session Auto-Login

```bash
# 1. Login to CRM first (in browser)
# 2. Copy the next-auth.session-token cookie value
# 3. Test WhatsMind sync endpoint:
curl -X GET http://localhost:3000/api/auth/sync-crm \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN_VALUE"
```

### Test 2: Direct Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

### Test 3: Protected Route Access

```bash
# Should return user data
curl -X GET http://localhost:3000/api/dashboard \
  -H "Cookie: token=YOUR_WHATSMIND_TOKEN"
```

## Support

For issues or questions:

1. Check this documentation
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify environment variables
5. Test database connectivity

## Summary

WhatsMind and CRM share authentication through:

- **Shared MongoDB database** with same User collection
- **NextAuth session token** from CRM recognized by WhatsMind
- **Admin role enforcement** at middleware and API level
- **Independent sessions** allowing separate logout behavior
- **Seamless UX** with automatic login when CRM session exists

This architecture provides secure, convenient access control while maintaining clear separation between the two applications.
