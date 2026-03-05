#!/bin/bash
# Check admin setup and provide diagnostics

echo "🔍 Checking authentication setup..."
echo ""

# Check environment variables
echo "✓ Environment Variables:"
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "  ✗ NEXTAUTH_SECRET is missing"
else
  echo "  ✓ NEXTAUTH_SECRET is set"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "  ✗ NEXTAUTH_URL is missing"
else
  echo "  ✓ NEXTAUTH_URL is set: $NEXTAUTH_URL"
fi

if [ -z "$MONGODB_URI" ]; then
  echo "  ✗ MONGODB_URI is missing"
else
  echo "  ✓ MONGODB_URI is set"
fi

if [ -z "$ADMIN_SECRET_KEY" ]; then
  echo "  ✗ ADMIN_SECRET_KEY is missing"
else
  echo "  ✓ ADMIN_SECRET_KEY is set"
fi

echo ""
echo "To make a user an admin, use one of these methods:"
echo ""
echo "Method 1: API Call (easiest)"
echo '  curl -X POST http://localhost:3000/api/admin/set-admin \\'
echo '    -H "Content-Type: application/json" \\'
echo '    -d "{\"secretKey\": \"YOUR_ADMIN_SECRET_KEY_HERE\"}"'
echo ""
echo "  (You must be signed in first)"
echo ""
echo "Method 2: Using the Node.js script"
echo "  node scripts/set-admin.js"
