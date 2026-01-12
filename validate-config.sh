#!/bin/bash

# WhatsMind Configuration Validator
# Checks if authentication is properly configured

set -e

echo "========================================="
echo "WhatsMind Configuration Validator"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if .env exists
echo "📋 Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "   Run: cp .env.example .env"
    exit 1
fi
echo -e "${GREEN}✅ .env file exists${NC}"

# Load environment variables
source .env

# Check JWT_SECRET
echo ""
echo "🔐 Checking JWT_SECRET..."
if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ Error: JWT_SECRET is not set${NC}"
    ERRORS=$((ERRORS + 1))
elif [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠️  Warning: JWT_SECRET is too short (should be 32+ characters)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ JWT_SECRET is configured (${#JWT_SECRET} characters)${NC}"
fi

# Check NEXTAUTH_SECRET (CRITICAL!)
echo ""
echo "🔑 Checking NEXTAUTH_SECRET..."
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${RED}❌ CRITICAL: NEXTAUTH_SECRET is not set${NC}"
    echo "   This MUST match your CRM's NEXTAUTH_SECRET"
    ERRORS=$((ERRORS + 1))
elif [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    echo -e "${YELLOW}⚠️  Warning: NEXTAUTH_SECRET is too short${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ NEXTAUTH_SECRET is configured (${#NEXTAUTH_SECRET} characters)${NC}"
fi

# Check MongoDB URI
echo ""
echo "🗄️  Checking MongoDB configuration..."
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ Error: MONGODB_URI is not set${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ MONGODB_URI is set: $MONGODB_URI${NC}"
fi

# Check MongoDB Database
if [ -z "$MONGODB_DATABASE" ]; then
    echo -e "${RED}❌ Error: MONGODB_DATABASE is not set${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$MONGODB_DATABASE" == "whatsmind" ]; then
    echo -e "${YELLOW}⚠️  Warning: Using default database 'whatsmind'${NC}"
    echo "   Should this be your CRM database name instead?"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ MONGODB_DATABASE is set: $MONGODB_DATABASE${NC}"
fi

# Test MongoDB connection
echo ""
echo "🔌 Testing MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh "$MONGODB_URI$MONGODB_DATABASE" --eval "db.version()" &> /dev/null; then
        DB_VERSION=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.version()")
        echo -e "${GREEN}✅ Connected to MongoDB $DB_VERSION${NC}"

        # Check for users collection
        echo ""
        echo "👥 Checking users collection..."
        if mongosh "$MONGODB_URI$MONGODB_DATABASE" --eval "db.users.findOne()" &> /dev/null; then
            TOTAL_USERS=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.users.countDocuments()")
            echo -e "${GREEN}✅ Users collection exists ($TOTAL_USERS users)${NC}"

            # Check for admin users
            ADMIN_USERS=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.users.countDocuments({role: 'Admin'})")
            ENABLED_ADMINS=$(mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval "db.users.countDocuments({role: 'Admin', status: 'Enabled'})")

            echo ""
            echo "👑 Admin users:"
            echo "   Total Admins: $ADMIN_USERS"
            echo "   Enabled Admins: $ENABLED_ADMINS"

            if [ "$ENABLED_ADMINS" -eq 0 ]; then
                echo -e "${RED}❌ CRITICAL: No enabled Admin users found${NC}"
                echo "   WhatsMind requires at least one Admin user"
                echo "   To fix, update a user in your CRM or run:"
                echo "   mongosh \"$MONGODB_URI$MONGODB_DATABASE\" --eval \"db.users.updateOne({email: 'user@example.com'}, {\\\$set: {role: 'Admin', status: 'Enabled'}})\""
                ERRORS=$((ERRORS + 1))
            else
                echo -e "${GREEN}✅ Found $ENABLED_ADMINS enabled Admin user(s)${NC}"

                # List admin emails
                echo ""
                echo "📧 Admin user emails:"
                mongosh "$MONGODB_URI$MONGODB_DATABASE" --quiet --eval \
                    "db.users.find({role: 'Admin', status: 'Enabled'}, {email: 1, name: 1, _id: 0}).forEach(u => print('   - ' + u.email + (u.name ? ' (' + u.name + ')' : '')))"
            fi
        else
            echo -e "${RED}❌ Error: Users collection not found${NC}"
            echo "   This database may not be your CRM database"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${RED}❌ Error: Cannot connect to MongoDB${NC}"
        echo "   Check if MongoDB is running and credentials are correct"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  mongosh not installed - skipping database checks${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Node.js version
echo ""
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js $NODE_VERSION detected (18+ recommended)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Node.js $(node -v) is installed${NC}"
fi

# Check if node_modules exists
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Run: npm install"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "========================================="
echo "Validation Summary"
echo "========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! Configuration is valid${NC}"
    echo ""
    echo "You're ready to start:"
    echo "  npm run dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration valid with $WARNINGS warning(s)${NC}"
    echo ""
    echo "You can proceed, but review the warnings above"
    exit 0
else
    echo -e "${RED}❌ Configuration has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before starting"
    exit 1
fi
