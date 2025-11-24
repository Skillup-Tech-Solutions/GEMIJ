#!/bin/bash

# This script will comment out the SENDGRID_API_KEY in your .env file
# so that Mailjet becomes the only configured provider

echo "Fixing .env to use Mailjet exclusively..."

# Backup the .env file first
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backup created: .env.backup.$(date +%Y%m%d_%H%M%S)"

# Comment out SENDGRID_API_KEY
sed -i.tmp 's/^SENDGRID_API_KEY=/#SENDGRID_API_KEY=/' .env
rm -f .env.tmp

echo "✓ SENDGRID_API_KEY has been commented out"
echo ""
echo "Current email configuration:"
grep -E "^(EMAIL_PROVIDER|#SENDGRID|MAILJET|FROM_)" .env
echo ""
echo "✅ Done! Now restart your server:"
echo "   1. Stop the server (Ctrl+C)"
echo "   2. Run: npm run dev"
echo ""
echo "The server will now use Mailjet for all emails."
