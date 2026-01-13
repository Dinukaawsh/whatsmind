# Webhook Authentication Configuration Guide

This guide explains how to configure the `WEBHOOK_AUTH_HEADER` environment variable for secure webhook communication.

## Overview

The `WEBHOOK_AUTH_HEADER` is used to authenticate requests sent to your n8n webhook (or any other webhook service). This ensures that only authorized requests from your WhatsMind application can trigger the webhook.

**Key Concept:** The token you put in `WEBHOOK_AUTH_HEADER` must **match exactly** what your n8n webhook expects. You can either:

- Use the token that n8n provides/shows you, OR
- Generate your own token and configure n8n to accept it

Both methods work - just make sure they match!

## Configuration

Add the following to your `.env` file:

```env
# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Webhook Authentication Header (optional but recommended)
WEBHOOK_AUTH_HEADER=Bearer your-secret-token-here
```

## Authentication Header Formats

The `WEBHOOK_AUTH_HEADER` supports different authentication formats:

### 1. Bearer Token (Most Common)

```env
WEBHOOK_AUTH_HEADER=Bearer your-secret-token-12345
```

**When to use:** Most modern APIs and webhook services use Bearer tokens.

**How to get:**

- If using n8n: Check your webhook's authentication settings
- If using a custom webhook: Generate a secure random token

### 2. API Key (Simple)

```env
WEBHOOK_AUTH_HEADER=your-api-key-here
```

**When to use:** Simple webhook services that accept plain API keys.

**How to get:**

- Check your webhook service's API key settings
- Generate a secure random string (32+ characters recommended)

### 3. Basic Authentication

```env
WEBHOOK_AUTH_HEADER=Basic base64(username:password)
```

**When to use:** Webhooks that require HTTP Basic Authentication.

**How to generate:**

```bash
# Example: username=webhook, password=secret123
echo -n "webhook:secret123" | base64
# Output: d2ViaG9vazpzZWNyZXQxMjM=
# Then use: WEBHOOK_AUTH_HEADER=Basic d2ViaG9vazpzZWNyZXQxMjM=
```

### 4. Custom Header Format

```env
WEBHOOK_AUTH_HEADER=X-API-Key: your-custom-key
```

**When to use:** Webhooks that require custom header formats.

## How to Get Webhook Auth Header

### For n8n Webhooks - Step by Step

**The key point:** The token must match between n8n and your WhatsMind app!

#### Method 1: Use n8n's Token (Recommended)

1. **Open your n8n workflow**
2. **Click on the Webhook node**
3. **Enable Authentication:**

   - Click on "Authentication" dropdown
   - Select "Header Auth" or "Basic Auth"

4. **If using Header Auth:**

   - **Option A:** n8n shows you a token → Copy it
   - **Option B:** You set a custom token → Remember it
   - The token format shown in n8n is what you need

5. **Add to your `.env` file:**

   ```env
   # If n8n shows: "Bearer abc123xyz"
   WEBHOOK_AUTH_HEADER=Bearer abc123xyz

   # OR if n8n shows just: "abc123xyz"
   WEBHOOK_AUTH_HEADER=Bearer abc123xyz
   # (usually you need to add "Bearer " prefix)
   ```

6. **Important:** The token in your `.env` must **exactly match** what n8n expects!

#### Method 2: Generate Your Own Token

1. **Generate a secure token:**

   ```bash
   openssl rand -hex 32
   # Example output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   ```

2. **Configure n8n to accept this token:**

   - In n8n Webhook node → Authentication → Header Auth
   - Set the value to: `Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   - (Or whatever format n8n requires)

3. **Add to your `.env` file:**

   ```env
   WEBHOOK_AUTH_HEADER=Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   ```

4. **Important:** Use the **same token** in both places!

#### Quick Reference: Token Flow

```
┌─────────────────┐         ┌──────────────────┐
│   Your .env     │         │   n8n Webhook    │
│                 │         │                  │
│ WEBHOOK_AUTH_   │  ────>  │  Expects:        │
│ HEADER=Bearer   │         │  "Bearer         │
│ abc123xyz       │         │   abc123xyz"     │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            │
        └──────── Must Match ────────┘
```

#### Alternative: n8n Webhook Path Authentication

Some n8n webhooks use path-based auth: `https://n8n.com/webhook/your-path?auth=your-token`

- In this case, include the auth in the URL instead:
  ```env
  N8N_WEBHOOK_URL=https://n8n.com/webhook/your-path?auth=your-token
  WEBHOOK_AUTH_HEADER=  # Leave empty
  ```

### For Custom Webhooks

1. **Check your webhook service documentation**
2. **Look for authentication requirements:**

   - API Key
   - Bearer Token
   - Basic Auth
   - Custom headers

3. **Generate a secure token:**

   ```bash
   # Generate a random secure token
   openssl rand -hex 32
   # or
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Configure your webhook service to accept this token**

## Security Best Practices

1. **Use Strong Tokens:**

   - Minimum 32 characters
   - Random and unpredictable
   - Use cryptographically secure random generators

2. **Store Securely:**

   - Never commit `.env` file to version control
   - Use environment variables in production
   - Rotate tokens periodically

3. **Validate on Webhook Side:**
   - Always verify the auth header in your webhook handler
   - Reject requests with invalid/missing auth headers

## Testing Your Configuration

### Test 1: Check if webhook is called

1. Set up your webhook URL and auth header in `.env`
2. Try launching a campaign for a lead
3. Check your webhook logs/service to see if the request arrived
4. Verify the `Authorization` header is present in the request

### Test 2: Verify authentication

1. Temporarily set a wrong auth header
2. Try launching a campaign
3. Your webhook should reject the request
4. Restore the correct auth header

### Test 3: Manual curl test

```bash
# Test with Bearer token
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"leadId":"test123","phone":"+1234567890"}'

# Test with API key
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: your-api-key" \
  -d '{"leadId":"test123","phone":"+1234567890"}'
```

## Troubleshooting

### Webhook not receiving requests

1. **Check URL is correct:**

   ```bash
   echo $N8N_WEBHOOK_URL
   ```

2. **Check auth header format:**

   ```bash
   echo $WEBHOOK_AUTH_HEADER
   ```

3. **Check application logs:**
   - Look for webhook errors in console
   - Check network requests in browser dev tools

### "Failed to launch campaign via webhook" error

1. **Verify webhook URL is accessible:**

   ```bash
   curl -I $N8N_WEBHOOK_URL
   ```

2. **Check authentication:**

   - Verify auth header format matches webhook requirements
   - Test with curl (see above)

3. **Check webhook service logs:**
   - n8n execution logs
   - Custom webhook service logs

### Authentication rejected

1. **Verify token is correct:**

   - Double-check the token in `.env`
   - Ensure no extra spaces or quotes

2. **Check header format:**
   - Bearer tokens need "Bearer " prefix
   - API keys might not need prefix
   - Check your webhook service documentation

## Example Configurations

### n8n with Header Auth

```env
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/abc123
WEBHOOK_AUTH_HEADER=Bearer n8n-webhook-secret-token-xyz789
```

### n8n with Basic Auth

```env
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/abc123
WEBHOOK_AUTH_HEADER=Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### Custom API with API Key

```env
N8N_WEBHOOK_URL=https://api.yourdomain.com/webhooks/campaign-launch
WEBHOOK_AUTH_HEADER=your-api-key-1234567890abcdef
```

### No Authentication (Not Recommended)

```env
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/abc123
WEBHOOK_AUTH_HEADER=
# or simply omit the variable
```

## Need Help?

If you're still having issues:

1. Check your webhook service documentation
2. Review application logs for detailed error messages
3. Test webhook manually with curl
4. Verify environment variables are loaded correctly
