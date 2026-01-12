# Contacts Integration - CRM Leads to WhatsApp

## Overview

The Contacts section in WhatsMind displays leads directly from your CRM database. This integration allows you to:

- View all active leads from CRM
- Search leads by name, phone, or email
- Start WhatsApp conversations with leads
- See lead details including multiple phone numbers

## How It Works

### Data Flow

```
CRM Database (leads collection)
         ↓
    Lead Model (WhatsMind)
         ↓
  API: /api/contacts (GET)
         ↓
  Contacts Page (Frontend)
         ↓
 Start WhatsApp Conversation
```

### Database Structure

**Source**: CRM `leads` collection

**Fields Used**:

- `firstName` - Lead's first name
- `lastName` - Lead's last name
- `email` - Lead's email address
- `phone` - Array of phone numbers with types (mobile, work, home)
- `isActive` - Only active leads are shown
- `createdAt` / `updatedAt` - Timestamps

### Contact Transformation

Leads from CRM are transformed into contacts:

```typescript
{
  _id: "lead_id",
  name: "First Last",           // Combined firstName + lastName
  firstName: "First",
  lastName: "Last",
  phoneNumber: "+1234567890",   // Primary phone (prefer mobile)
  phoneType: "mobile",          // Type of primary phone
  allPhones: [                  // All available phone numbers
    { type: "mobile", number: "+1234567890" },
    { type: "work", number: "+0987654321" }
  ],
  email: "lead@example.com",
  status: "active",             // All CRM leads are "active"
  source: "CRM Lead",
  createdAt: "2026-01-12T...",
  updatedAt: "2026-01-12T..."
}
```

## Features

### 1. Lead Display

- Shows all active leads from CRM (`isActive: true`)
- Displays name, primary phone, email, and status
- Indicates phone type (mobile/work/home)
- Shows count of additional phone numbers if available

### 2. Search Functionality

- Search by first name
- Search by last name
- Search by email
- Search by phone number
- Real-time filtering as you type
- Press Enter or click Search button

### 3. WhatsApp Integration

Each contact has a "WhatsApp" button that:

- Formats the phone number correctly
- Opens WhatsApp Web in new tab
- Pre-fills the contact's number
- Shows success notification

**WhatsApp URL Format**: `https://wa.me/{phoneNumber}`

### 4. Phone Number Priority

When a lead has multiple phone numbers:

1. **Mobile** (preferred for WhatsApp)
2. **Work** (fallback)
3. **Home** (last resort)
4. First available number

## API Endpoints

### GET `/api/contacts`

Fetches leads from CRM database.

**Query Parameters**:

- `search` (optional) - Search term for filtering
- `status` (optional) - Filter by status (currently unused)

**Response**:

```json
{
  "contacts": [
    {
      "_id": "65abc123...",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "phoneType": "mobile",
      "allPhones": [
        { "type": "mobile", "number": "+1234567890" },
        { "type": "work", "number": "+0987654321" }
      ],
      "email": "john@example.com",
      "status": "active",
      "source": "CRM Lead",
      "createdAt": "2026-01-12T10:00:00.000Z",
      "updatedAt": "2026-01-12T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Authentication**: Requires Admin role (JWT token)

**Error Responses**:

- `403` - Unauthorized (not admin)
- `500` - Internal server error

## UI Components

### Contacts Table

Columns:

1. **Name** - Full name + phone type indicator
2. **Phone Number** - Primary phone + count of additional numbers
3. **Email** - Email address or "-"
4. **Source** - Badge showing "CRM Lead"
5. **Status** - Badge showing status (active/blocked/unsubscribed)
6. **Actions** - WhatsApp button

### Search Bar

- Real-time search input
- Search button
- Refresh button to reload leads

### Summary Footer

Shows count of displayed leads

## Code Structure

### Files Created/Modified

```
whats-mind/
├── lib/models/
│   └── Lead.ts                    # Lead model (matches CRM structure)
├── app/api/contacts/
│   └── route.ts                   # API to fetch and transform leads
├── app/src/pages/
│   └── Contacts.tsx               # UI for displaying leads
└── app/src/types/
    └── index.ts                   # TypeScript interfaces
```

### Key Components

**Lead Model** (`lib/models/Lead.ts`):

```typescript
export interface ILead {
  firstName: string;
  lastName: string;
  email: string;
  phone: IPhone[]; // Array of phone objects
  isActive: boolean;
  // ... other fields
}
```

**API Handler** (`app/api/contacts/route.ts`):

- Authenticates admin users
- Queries `leads` collection
- Filters active leads only
- Transforms to contact format
- Handles search queries

**Frontend** (`app/src/pages/Contacts.tsx`):

- Displays leads in table
- Handles search
- Opens WhatsApp conversations
- Shows loading states

## Usage Examples

### Starting a WhatsApp Conversation

1. Navigate to Contacts page
2. Find the lead you want to contact
3. Click the "WhatsApp" button
4. WhatsApp Web opens in new tab
5. Chat is ready with the contact's number

### Searching for Leads

```typescript
// Search by name
"john doe";

// Search by email
"john@example.com";

// Search by phone
"+1234567890";
"1234567890";
```

### Phone Number Formatting

The system automatically:

- Removes spaces, dashes, parentheses
- Keeps country code (+)
- Formats for WhatsApp URL

```typescript
Input: "+1 (234) 567-8900";
Output: "+12345678900";
URL: "https://wa.me/12345678900";
```

## Configuration

### Environment Variables

No additional configuration needed beyond the standard CRM database connection:

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=your-crm-database-name
```

### Database Requirements

- CRM database must have `leads` collection
- Leads must have required fields (firstName, lastName, email, phone)
- At least one phone number per lead

## Troubleshooting

### No Leads Showing

**Problem**: Contacts page is empty

**Solutions**:

1. Check CRM database has leads with `isActive: true`
2. Verify MongoDB connection is correct
3. Check browser console for errors
4. Verify you're logged in as Admin

```bash
# Check for active leads
mongosh "mongodb://localhost:27017/your-database" \
  --eval "db.leads.countDocuments({isActive: true})"
```

### WhatsApp Not Opening

**Problem**: WhatsApp button doesn't work

**Solutions**:

1. Check phone number format is valid
2. Ensure popup blocker is disabled
3. Verify WhatsApp Web is accessible
4. Try with different phone number type

### Search Not Working

**Problem**: Search doesn't return results

**Solutions**:

1. Try exact match first
2. Check spelling
3. Try partial search
4. Refresh the page
5. Check API response in Network tab

### Phone Number Issues

**Problem**: Wrong phone number being used

**Explanation**: System prioritizes mobile > work > home

**Solution**:

- Ensure mobile numbers are marked with `type: "mobile"`
- Check lead data in CRM database
- Update phone number types in CRM

## Future Enhancements

Potential improvements:

1. **Filters**

   - Filter by phone type
   - Filter by email availability
   - Filter by date range

2. **Bulk Actions**

   - Send WhatsApp to multiple contacts
   - Export contacts to CSV
   - Bulk status updates

3. **Lead Details**

   - View full lead information from CRM
   - See interaction history
   - Display tags and status from CRM

4. **WhatsApp History**

   - Track conversations
   - Save message templates
   - View reply rates

5. **Sync Status**
   - Two-way sync with CRM
   - Update lead status from WhatsApp
   - Track WhatsApp engagement in CRM

## Testing

### Test Lead Display

```bash
# Create test lead in CRM
mongosh "mongodb://localhost:27017/your-database" --eval '
db.leads.insertOne({
  firstName: "Test",
  lastName: "Lead",
  email: "test@example.com",
  phone: [
    { type: "mobile", number: "+1234567890" }
  ],
  isActive: true,
  createdBy: ObjectId("your-user-id"),
  companyId: ObjectId("your-company-id"),
  dateInscription: new Date()
})
'
```

### Test Search

1. Go to Contacts page
2. Enter search term
3. Verify results update
4. Clear search
5. Verify all leads show again

### Test WhatsApp

1. Click WhatsApp button on any contact
2. Verify new tab opens
3. Check WhatsApp Web loads
4. Verify correct number is pre-filled

## Performance Considerations

- Leads are fetched on page load
- Search is performed server-side for large datasets
- Results are cached in component state
- Refresh button re-fetches from database

## Security

- ✅ Admin-only access enforced
- ✅ JWT authentication required
- ✅ No sensitive data exposed to non-admins
- ✅ SQL injection prevented by Mongoose
- ✅ XSS protection via React

## Summary

The Contacts integration provides a seamless bridge between your CRM leads and WhatsApp conversations. All active leads are automatically available, searchable, and ready for instant communication via WhatsApp Web.

**Key Benefits**:

- No manual import needed
- Real-time data from CRM
- One-click WhatsApp access
- Smart phone number selection
- Easy search and filtering
