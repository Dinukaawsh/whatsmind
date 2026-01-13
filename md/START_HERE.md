# 🎯 START HERE - WhatsMind & CRM Shared Authentication

## What You Have Now

Your WhatsMind application is now configured to share authentication with your CRM. Here's what this means:

✅ **Same Database**: Both apps use the same MongoDB database
✅ **Same Users**: CRM users can access WhatsMind (if they're Admins)
✅ **Auto Login**: Login to CRM = automatic access to WhatsMind
✅ **Separate Sessions**: Logout from one doesn't affect the other

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Environment

```bash
cd whats-mind
npm run setup
```

This will ask you for:

- Your CRM's `NEXTAUTH_SECRET` (CRITICAL - must match exactly!)
- Your MongoDB database name (same as CRM)
- Your MongoDB connection URI

### Step 2: Validate Configuration

```bash
npm run validate
```

This checks:

- Environment variables are set
- Database connection works
- Admin users exist

### Step 3: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 (or another port if 3000 is taken by CRM)

## 🧪 Testing It Works

### Test 1: Auto-Login from CRM

1. Login to your CRM application
2. Open WhatsMind in a new browser tab
3. **You should be automatically logged in!** ✅

### Test 2: Direct Login

1. Logout from CRM (or use incognito window)
2. Open WhatsMind
3. Enter your CRM admin email and password
4. **You should be able to login!** ✅

### Test 3: Non-Admin Access

1. Try to login with a non-admin CRM user
2. **You should see "Unauthorized" message** ✅

## 📋 Important Configuration

### In CRM's .env:

```env
NEXTAUTH_SECRET=your-secret-here-123456789
MONGODB_URI=mongodb://localhost:27017/
# or similar MongoDB config
```

### In WhatsMind's .env (MUST MATCH):

```env
NEXTAUTH_SECRET=your-secret-here-123456789  # Same as CRM!
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=your-crm-database-name     # Same database!
JWT_SECRET=different-secret-for-whatsmind   # Can be different
```

## 🔍 Verify Admin User

Check if you have admin users:

```bash
npm run db:admins
```

If it returns 0, make a user admin:

```bash
mongosh "mongodb://localhost:27017/your-database" --eval \
  "db.users.updateOne(
    {email: 'your-email@example.com'},
    {\$set: {role: 'Admin', status: 'Enabled'}}
  )"
```

## 📚 Documentation Files

| File                          | Purpose                          |
| ----------------------------- | -------------------------------- |
| **IMPLEMENTATION_SUMMARY.md** | Overview of what was implemented |
| **QUICK_START.md**            | Fast reference guide             |
| **AUTHENTICATION_SETUP.md**   | Complete technical documentation |
| **README.md**                 | General project information      |

## 🛠️ Useful Commands

```bash
# Setup and validation
npm run setup           # Interactive setup wizard
npm run validate        # Validate configuration

# Database checks
npm run db:check        # List all admin users
npm run db:admins       # Count admin users

# Development
npm install             # Install dependencies
npm run dev            # Start dev server
npm run build          # Build for production
npm start              # Start production server

# Manual scripts
./setup-auth.sh        # Same as npm run setup
./validate-config.sh   # Same as npm run validate
```

## ⚠️ Critical Points

1. **NEXTAUTH_SECRET Must Match**

   - This is the MOST important configuration
   - CRM and WhatsMind must use the EXACT same value
   - Case-sensitive, character-for-character match

2. **Same Database Required**

   - Both apps must connect to the same MongoDB database
   - User collection must be shared

3. **Admin Role Required**
   - Only users with `role: "Admin"` can access WhatsMind
   - User must also have `status: "Enabled"`

## 🐛 Troubleshooting

### "No CRM session found"

**Problem**: You're not logged into CRM
**Solution**: Login to CRM first, or use direct login

### "Invalid CRM session"

**Problem**: NEXTAUTH_SECRET doesn't match
**Solution**: Check both .env files have identical NEXTAUTH_SECRET

### "Access denied"

**Problem**: User is not an Admin
**Solution**: Update user role: `db.users.updateOne({email: '...'}, {$set: {role: 'Admin'}})`

### "User not found"

**Problem**: Wrong database or user doesn't exist
**Solution**: Verify MONGODB_DATABASE matches CRM

### Still Having Issues?

```bash
npm run validate  # Run this first - it will tell you what's wrong
```

## 🎯 Expected Behavior

### When logged into CRM:

```
User opens WhatsMind → Automatically logged in → Can use app
```

### When NOT logged into CRM:

```
User opens WhatsMind → Login page → Enter credentials → Logged in → Can use app
```

### When user is not Admin:

```
User tries to access → "Unauthorized" page → Cannot access
```

### When user logs out from WhatsMind:

```
Logout → WhatsMind session cleared → CRM session remains
If user refreshes → Auto-login from CRM session (if still logged into CRM)
```

## ✅ You're Ready When...

- ✅ `npm run validate` passes all checks
- ✅ You can login to CRM and automatically access WhatsMind
- ✅ Non-admin users see "Unauthorized" message
- ✅ Direct login with CRM credentials works

## 🆘 Need Help?

1. Run `npm run validate` - it will tell you what's wrong
2. Read **QUICK_START.md** for common issues
3. Read **AUTHENTICATION_SETUP.md** for detailed info
4. Check browser console for errors
5. Check server terminal for error messages

## 🚀 Next Steps After Setup

1. ✅ Verify authentication works (both auto-login and direct)
2. ✅ Test with multiple users (admin and non-admin)
3. ✅ Configure WhatsApp integration (if needed)
4. ✅ Deploy to production (see AUTHENTICATION_SETUP.md)
5. ✅ Set up monitoring and logging

---

**Quick Setup**: `npm run setup && npm run validate && npm run dev`

**Need more details?** See QUICK_START.md or AUTHENTICATION_SETUP.md
