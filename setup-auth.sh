#!/bin/bash

# WhatsMind Authentication Setup Script
# This script helps configure shared authentication with CRM

set -e

echo "========================================="
echo "WhatsMind - CRM Authentication Setup"
echo "========================================="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Existing .env backed up"
fi

# Copy example file
cp .env.example .env
echo "✅ Created .env from template"
echo ""

# Get CRM information
echo "📋 Please provide the following information from your CRM:"
echo ""

# JWT_SECRET
read -p "Enter JWT_SECRET (press Enter to generate random): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated random JWT_SECRET"
fi

# NEXTAUTH_SECRET (most important!)
echo ""
echo "⚠️  IMPORTANT: This MUST match your CRM's NEXTAUTH_SECRET exactly!"
read -p "Enter NEXTAUTH_SECRET from CRM: " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Error: NEXTAUTH_SECRET is required!"
    exit 1
fi

# MongoDB URI
echo ""
read -p "Enter MongoDB URI (default: mongodb://localhost:27017/): " MONGODB_URI
MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/}

# MongoDB Database
echo ""
echo "⚠️  IMPORTANT: This MUST be the same database name as your CRM!"
read -p "Enter MongoDB Database name: " MONGODB_DATABASE
if [ -z "$MONGODB_DATABASE" ]; then
    echo "❌ Error: MongoDB database name is required!"
    exit 1
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."

# Use different sed syntax for macOS vs Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
    sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI|" .env
    sed -i '' "s|MONGODB_DATABASE=.*|MONGODB_DATABASE=$MONGODB_DATABASE|" .env
else
    # Linux
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|" .env
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI|" .env
    sed -i "s|MONGODB_DATABASE=.*|MONGODB_DATABASE=$MONGODB_DATABASE|" .env
fi

echo "✅ Environment configured successfully!"
echo ""

# Verify configuration
echo "========================================="
echo "Configuration Summary"
echo "========================================="
echo "JWT_SECRET: ${JWT_SECRET:0:20}... (hidden)"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:20}... (hidden)"
echo "MONGODB_URI: $MONGODB_URI"
echo "MONGODB_DATABASE: $MONGODB_DATABASE"
echo ""

# Test database connection
echo "========================================="
echo "Testing Database Connection"
echo "========================================="
if command -v mongosh &> /dev/null; then
    if mongosh "$MONGODB_URI$MONGODB_DATABASE" --eval "db.users.countDocuments()" &> /dev/null; then
        USER_COUNT=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.users.countDocuments()")
        echo "✅ Database connection successful!"
        echo "📊 Found $USER_COUNT users in database"

        # Count admin users
        ADMIN_COUNT=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.users.countDocuments({role: 'Admin', status: 'Enabled'})")
        echo "👑 Found $ADMIN_COUNT enabled Admin users"

        if [ "$ADMIN_COUNT" -eq 0 ]; then
            echo "⚠️  Warning: No enabled Admin users found!"
            echo "   WhatsMind requires at least one Admin user to function."
        fi
    else
        echo "❌ Could not connect to database"
        echo "   Please verify MongoDB is running and credentials are correct"
    fi
else
    echo "⚠️  mongosh not found - skipping database test"
    echo "   Install mongosh to test database connectivity"
fi

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo "1. ✅ Environment configured"
echo "2. 📖 Read AUTHENTICATION_SETUP.md for detailed documentation"
echo "3. 🔐 Verify NEXTAUTH_SECRET matches your CRM exactly"
echo "4. 📊 Ensure at least one Admin user exists in database"
echo "5. 🚀 Run: npm install"
echo "6. 🚀 Run: npm run dev"
echo "7. 🌐 Open: http://localhost:3000"
echo ""
echo "For troubleshooting, see AUTHENTICATION_SETUP.md"
echo ""
