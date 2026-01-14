#!/bin/bash
# Script to add all environment variables to Vercel
# Usage: ./setup-vercel-env.sh

set -e

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables first."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found!"
    echo "Install it with: pnpm add -g vercel"
    exit 1
fi

echo "📋 Reading environment variables from .env.local..."
echo ""

# Read .env.local and add each variable to Vercel
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Extract variable name and value
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"

        # Remove quotes if present
        var_value="${var_value%\"}"
        var_value="${var_value#\"}"

        echo "➕ Adding: $var_name"

        # Add to all environments (production, preview, development)
        echo "$var_value" | vercel env add "$var_name" production --force
        echo "$var_value" | vercel env add "$var_name" preview --force
        echo "$var_value" | vercel env add "$var_name" development --force
    fi
done < .env.local

echo ""
echo "✅ All environment variables have been added to Vercel!"
echo ""
echo "🔍 Verify variables at:"
echo "https://vercel.com/hellowhq67s-projects/pedagogistspte-v-0-2/settings/environment-variables"
echo ""
echo "⚠️  Note: Sensitive values are encrypted and not visible in dashboard"
