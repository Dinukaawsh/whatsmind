# WhatsMind - Quick Start Guide

## First Time Setup (5 Minutes)

### Option 1: Automated Setup (Recommended)

```bash
cd whats-mind
./setup-auth.sh
npm install
npm run dev
```

### Option 2: Manual Setup

```bash
cd whats-mind
cp .env.example .env

# Edit .env file with these CRITICAL values:
# 1. NEXTAUTH_SECRET - MUST match your CRM's value
# 2. MONGODB_DATABASE - MUST match your CRM's database name
# 3. MONGODB_URI - MUST point to same MongoDB as CRM

npm install
npm run dev
```

## Accessing WhatsMind

### If Already Logged into CRM

1. Open http://localhost:3000
2. ✅ **Automatically logged in!**

### If Not Logged into CRM

1. Open http://localhost:3000/login
2. Enter your CRM admin email and password
3. Click Login
4. ✅ **Now logged in!**

## Common Tasks

### Check If You're an Admin User

```bash
mongosh "mongodb://localhost:27017/your-database" --eval \
  "db.users.findOne({email: 'your-email@example.com'}, {role: 1, status: 1})"
```

Should show:

```json
{ "role": "Admin", "status": "Enabled" }
```

### Make a User Admin

```bash
mongosh "mongodb://localhost:27017/your-database" --eval \
  "db.users.updateOne(
    {email: 'user@example.com'},
    {\$set: {role: 'Admin', status: 'Enabled'}}
  )"
```

### Test CRM Session Sync

```bash
# While logged into CRM, get your session cookie and test:
curl -X GET http://localhost:3000/api/auth/sync-crm \
  --cookie "next-auth.session-token=YOUR_TOKEN_HERE"
```

### View Environment Configuration

```bash
cat .env | grep -E "NEXTAUTH_SECRET|MONGODB"
```

## Troubleshooting

### "No CRM session found"

- **Cause**: Not logged into CRM
- **Fix**: Login to CRM first, or use direct login

### "Invalid CRM session"

- **Cause**: NEXTAUTH_SECRET doesn't match CRM
- **Fix**: Copy exact NEXTAUTH_SECRET from CRM .env

### "Access denied. Only Admin users..."

- **Cause**: Your user role is not "Admin"
- **Fix**: Run the "Make a User Admin" command above

### "User not found"

- **Cause**: Wrong database or user doesn't exist
- **Fix**: Verify MONGODB_DATABASE matches CRM

### "Account is disabled"

- **Cause**: User status is not "Enabled"
- **Fix**: Update user: `db.users.updateOne({email: '...'}, {$set: {status: 'Enabled'}})`

## Environment Variables Checklist

Essential configuration (must be correct):

- [ ] `NEXTAUTH_SECRET` - Matches CRM exactly
- [ ] `MONGODB_URI` - Points to CRM's MongoDB
- [ ] `MONGODB_DATABASE` - Same database name as CRM
- [ ] At least one Admin user exists with status "Enabled"

Optional configuration:

- [ ] `JWT_SECRET` - For WhatsMind tokens (can be different)
- [ ] `WHATSAPP_*` - For WhatsApp integration (not needed for auth)

## Testing Authentication

### Test 1: Check Database Connection

```bash
mongosh "$MONGODB_URI$MONGODB_DATABASE" --eval "db.users.countDocuments({role: 'Admin'})"
```

Should return a number > 0

### Test 2: Verify Secrets Match

```bash
# In CRM directory
grep NEXTAUTH_SECRET .env

# In WhatsMind directory
grep NEXTAUTH_SECRET .env

# These should be IDENTICAL
```

### Test 3: Test Direct Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

Should return user data and set a cookie

### Test 4: Test Auto-Login from CRM

1. Login to CRM at http://localhost:3000 (or CRM's URL)
2. Open browser DevTools > Application > Cookies
3. Find `next-auth.session-token` cookie
4. Copy its value
5. Open WhatsMind at http://localhost:3001 (or WhatsMind's URL)
6. Should automatically login without credentials

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Scenario 1: User logged into CRM                           │
├─────────────────────────────────────────────────────────────┤
│ 1. User working in CRM                                      │
│ 2. Opens WhatsMind URL in new tab                          │
│ 3. ✅ Instantly logged in (no password needed)             │
│ 4. Can use WhatsMind immediately                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Scenario 2: User NOT logged into CRM                       │
├─────────────────────────────────────────────────────────────┤
│ 1. User opens WhatsMind URL                                │
│ 2. Sees login page                                         │
│ 3. Enters CRM admin email/password                         │
│ 4. ✅ Logged into WhatsMind                                │
│ 5. Can use application                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Scenario 3: User logs out from WhatsMind                   │
├─────────────────────────────────────────────────────────────┤
│ 1. User clicks Logout in WhatsMind                         │
│ 2. WhatsMind session cleared                               │
│ 3. Redirected to login page                                │
│ 4. If still logged into CRM: refresh to auto-login         │
│ 5. If not: enter credentials to login again                │
└─────────────────────────────────────────────────────────────┘
```

## Port Configuration

### Development

- **CRM**: http://localhost:3000
- **WhatsMind**: http://localhost:3001 (or another port)

Run WhatsMind on different port:

```bash
PORT=3001 npm run dev
```

### Production

Both apps should be on same parent domain for cookie sharing:

- **CRM**: https://crm.yourdomain.com
- **WhatsMind**: https://whatsmind.yourdomain.com

Or configure cookie domain in production (see AUTHENTICATION_SETUP.md)

## Quick Commands Reference

```bash
# Setup
./setup-auth.sh                    # Interactive setup
cp .env.example .env               # Manual setup

# Development
npm install                        # Install dependencies
npm run dev                        # Start dev server
npm run build                      # Build for production
npm start                          # Start production server

# Database
mongosh $MONGODB_URI$MONGODB_DATABASE   # Connect to database
db.users.find({role: 'Admin'})          # List admin users
db.users.countDocuments()               # Count all users

# Testing
curl localhost:3000/api/health          # Health check
curl localhost:3000/api/auth/sync-crm   # Test CRM sync

# Docker
docker-compose up -d               # Start with Docker
docker-compose logs -f             # View logs
docker-compose down                # Stop containers
```

## Getting Help

1. **Read the docs**: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
2. **Check environment**: Verify .env configuration
3. **Test database**: Ensure MongoDB connection works
4. **Verify admin**: Confirm admin user exists
5. **Check browser console**: Look for error messages
6. **Check server logs**: Review terminal output

## Security Reminders

- ✅ Use strong, random secrets (min 32 characters)
- ✅ Keep NEXTAUTH_SECRET in sync between CRM and WhatsMind
- ✅ Use HTTPS in production
- ✅ Set NODE_ENV=production in production
- ✅ Restrict admin role to trusted users only
- ✅ Never commit .env files to git
- ✅ Backup database regularly

## What's Next?

After successful setup:

1. ✅ Test login from CRM session
2. ✅ Test direct login with credentials
3. ✅ Verify admin access control
4. ✅ Configure WhatsApp integration (optional)
5. ✅ Deploy to production
6. ✅ Set up monitoring and logging

---

**Need detailed information?** See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for comprehensive documentation.
