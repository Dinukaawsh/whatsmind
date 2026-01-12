# WhatsMind - WhatsApp Automation Platform

WhatsMind is a comprehensive WhatsApp automation platform that allows you to manage campaigns, contacts, and track engagement metrics. Built with Next.js, TypeScript, MongoDB, and modern web technologies.

**🔐 Integrated with CRM**: WhatsMind shares authentication with your CRM application. Admin users logged into CRM can seamlessly access WhatsMind without re-authentication.

## Features

- 🤖 **Campaign Management** - Create, schedule, and manage WhatsApp campaigns
- 👥 **Contact Management** - Import, organize, and segment your contacts
- 📊 **Analytics Dashboard** - Track delivery rates, reply rates, and engagement metrics
- 🔐 **CRM Integration** - Seamless authentication sharing with CRM (Admin-only access)
- 🔑 **Secure Authentication** - JWT-based with NextAuth session support
- 📱 **WhatsApp Integration** - Direct integration with WhatsApp Business API
- 🐳 **Docker Support** - Easy deployment with Docker and Docker Compose
- 📈 **Real-time Tracking** - Monitor message status in real-time

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM (Shared with CRM)
- **Authentication:** JWT + NextAuth session sharing
- **UI Components:** Lucide React icons
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Notifications:** React Hot Toast

## Prerequisites

- Node.js 20.x or higher
- MongoDB 7.0 or higher (shared with CRM)
- Access to CRM's NEXTAUTH_SECRET
- WhatsApp Business API credentials (optional for development)

## Getting Started

### Quick Setup with Script

The easiest way to set up authentication:

```bash
# Run the interactive setup script
./setup-auth.sh
```

This script will:

- Create .env file from template
- Prompt for required CRM credentials
- Test database connectivity
- Verify admin users exist

### Manual Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd whats-mind
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure CRM Integration

**IMPORTANT**: WhatsMind shares authentication with your CRM. You need:

1. **Same MongoDB database** as CRM
2. **Same NEXTAUTH_SECRET** as CRM
3. At least one **Admin user** in the database

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed configuration guide.

### 4. Set up environment variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Critical Configuration:**

```env
# Must match CRM's JWT secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# MUST MATCH CRM's NEXTAUTH_SECRET - This is critical!
NEXTAUTH_SECRET=same-as-crm-nextauth-secret

# MUST point to the SAME database as CRM
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=your-crm-database-name  # Same as CRM!

# WhatsApp Configuration (optional for development)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
```

### 5. Verify Admin User Exists

WhatsMind requires users with `role: "Admin"` and `status: "Enabled"`:

```bash
# Check if admin users exist in your CRM database
mongosh "mongodb://localhost:27017/your-crm-database" --eval "db.users.find({role: 'Admin', status: 'Enabled'}).pretty()"
```

If no admin users exist, update a user or create one in your CRM.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### For Users Already Logged into CRM

1. Open WhatsMind in browser
2. **Automatically logged in** (no credentials needed)
3. Start using the application

### For Users Not Logged into CRM

1. Open WhatsMind login page
2. Enter your **CRM admin credentials**
3. Login and access the application

### Logging Out

- Logout from WhatsMind: Clears WhatsMind session only
- If still logged into CRM, refresh to auto-login again
- Logout from CRM: Clears both sessions

📖 **For detailed authentication documentation, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)**

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker only

```bash
# Build the image
docker build -t whatsmind .

# Run the container
docker run -p 3000:3000 --env-file .env whatsmind
```

## Project Structure

```
whats-mind/
├── app/                        # Next.js app directory
│   ├── api/                   # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── campaigns/        # Campaign management
│   │   ├── contacts/         # Contact management
│   │   └── dashboard/        # Dashboard metrics
│   ├── src/                  # Source components
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript types
│   ├── campaigns/            # Campaigns page
│   ├── contacts/             # Contacts page
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (Dashboard)
├── lib/                       # Utility libraries
│   ├── db.ts                 # Database connection
│   └── models/               # Mongoose models
│       ├── User.ts
│       ├── Campaign.ts
│       ├── Contact.ts
│       └── Message.ts
├── public/                    # Static files
├── scripts/                   # Utility scripts
│   └── createUser.js         # User creation script
├── .env.example              # Environment variables template
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker configuration
├── middleware.ts             # Next.js middleware
└── package.json              # Dependencies
```

## API Routes

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/create-user` - Create new user

### Campaigns

- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign

### Contacts

- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact

### Dashboard

- `GET /api/dashboard` - Get dashboard metrics and stats

## Database Models

### User

- email (unique)
- username (unique)
- password (hashed)
- timestamps

### Campaign

- name
- description
- status (draft, scheduled, running, paused, completed, failed)
- messageTemplate
- targetContacts
- statistics (sent, delivered, read, replied)
- settings (delay, limits, time windows)
- timestamps

### Contact

- name
- phoneNumber (unique per user)
- email
- tags
- customFields
- status (active, unsubscribed, blocked)
- timestamps

### Message

- campaignId
- contactId
- phoneNumber
- message
- status (pending, sent, delivered, read, failed)
- timestamps
- reply information

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:

- `JWT_SECRET` - Secret for JWT token signing
- `MONGODB_URI` - MongoDB connection string
- `WHATSAPP_API_URL` - WhatsApp API endpoint
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp API access token

## Security

- Passwords are hashed using bcryptjs with salt rounds
- JWT tokens are stored in HTTP-only cookies
- Middleware protects all routes except login and public paths
- Input validation on all API endpoints
- MongoDB injection prevention through Mongoose

## Similar Project

This project follows a similar architecture to the [mail-app](./mail-app) email automation platform, adapted for WhatsApp automation.

## License

This project is licensed under the MIT License.

## Support

For support, email team@whatsmind.com or open an issue in the repository.
