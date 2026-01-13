# Setup Webhook Authentication: Generate Token & Validate in n8n

This guide shows you how to **generate your own token**, send it from WhatsMind, and have n8n validate it.

## Quick Setup (3 Steps)

### Step 1: Generate Your Token

Run this command to generate a secure token:

```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Save this token** - you'll need it in both places!

### Step 2: Configure n8n to Validate This Token

1. **Open your n8n workflow**
2. **Click on the Webhook node**
3. **Enable Authentication:**
   - Click "Authentication" dropdown
   - Select **"Header Auth"**
4. **Configure Header Auth:**
   - **Name:** `Authorization` (or leave default)
   - **Value:** `Bearer YOUR_TOKEN_HERE`
     - Replace `YOUR_TOKEN_HERE` with the token you generated
     - Example: `Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
5. **Save the workflow**

**Important:** n8n will now **only accept requests** that have this exact token in the `Authorization` header!

### Step 3: Add Token to WhatsMind `.env`

Add the token to your `.env` file:

```env
# Your n8n webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# The token you generated (must match n8n!)
WEBHOOK_AUTH_HEADER=Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Important:**
- Use the **exact same token** you configured in n8n
- Include the `Bearer ` prefix if n8n expects it (usually yes)

## How It Works

```
┌─────────────────────┐
│  1. You Generate    │
│     Token           │
│  (openssl command)   │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  2. Configure     │  │  3. Add to       │
│     n8n           │  │     .env         │
│                   │  │                  │
│  Expects:         │  │  Sends:          │
│  Bearer token     │  │  Bearer token    │
└──────────────────┘  └──────────────────┘
           │                 │
           └────────┬────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  4. WhatsMind     │
          │     sends token  │
          │     in header    │
          └─────────┬────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  5. n8n          │
          │     validates    │
          │     token        │
          │                  │
          │  ✅ Match?       │
          │  → Process       │
          │  ❌ No match?    │
          │  → Reject        │
          └──────────────────┘
```

## Testing

### Test 1: Verify Token is Sent

1. Launch a campaign for a lead in WhatsMind
2. Check n8n execution logs
3. You should see the request was accepted (if token matches)

### Test 2: Verify Security

1. Temporarily change token in `.env` to wrong value
2. Try launching a campaign
3. n8n should reject the request
4. Restore correct token

### Test 3: Manual Test with curl

```bash
# Replace with your actual values
curl -X POST https://your-n8n-webhook-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "leadId": "test123",
    "phone": "+1234567890",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

If n8n accepts it, your token is working! ✅

## Troubleshooting

### n8n Rejects Requests

**Check:**
1. Token in `.env` matches token in n8n **exactly**
2. Both include/exclude `Bearer ` prefix consistently
3. No extra spaces or quotes in `.env` file
4. n8n webhook is active and listening

**Common mistakes:**
- Token in `.env`: `Bearer abc123`
- Token in n8n: `abc123` (missing Bearer)
- Solution: Make them match!

### Token Format Issues

**If n8n expects:**
- `Bearer token` → Use: `WEBHOOK_AUTH_HEADER=Bearer your-token`
- `token` (no Bearer) → Use: `WEBHOOK_AUTH_HEADER=your-token`

Check n8n's Header Auth configuration to see the exact format it expects.

## Security Best Practices

1. **Use Strong Tokens:**
   - Minimum 32 characters
   - Use `openssl rand -hex 32` or similar
   - Never use simple passwords

2. **Keep Token Secret:**
   - Never commit `.env` to git
   - Don't share token in screenshots/logs
   - Rotate token periodically

3. **Use HTTPS:**
   - Always use `https://` for webhook URLs
   - Never send tokens over unencrypted connections

## Complete Example

```bash
# 1. Generate token
$ openssl rand -hex 32
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# 2. Configure n8n:
#    Webhook Node → Authentication → Header Auth
#    Value: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# 3. Add to .env:
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/abc123
WEBHOOK_AUTH_HEADER=Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# 4. Restart your WhatsMind app
npm run dev

# 5. Test by launching a campaign!
```

That's it! Your token is now being sent from WhatsMind and validated by n8n. 🔒✅
