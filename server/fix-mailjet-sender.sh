#!/bin/bash

echo "======================================================================="
echo "MAILJET SENDER EMAIL FIX"
echo "======================================================================="
echo ""
echo "Current sender: info@gemijjournal.online (Status: Inactive ❌)"
echo ""
echo "Available VERIFIED senders:"
echo "1. skilluptechsolution@gmail.com (Active ✓)"
echo "2. noreply@gemij.dpdns.org (Active ✓)"
echo "3. Keep info@gemijjournal.online and verify it manually"
echo ""
read -p "Choose option (1, 2, or 3): " choice

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

case $choice in
  1)
    sed -i.tmp 's/^FROM_EMAIL=.*/FROM_EMAIL="skilluptechsolution@gmail.com"/' .env
    rm -f .env.tmp
    echo ""
    echo "✅ Updated FROM_EMAIL to: skilluptechsolution@gmail.com"
    ;;
  2)
    sed -i.tmp 's/^FROM_EMAIL=.*/FROM_EMAIL="noreply@gemij.dpdns.org"/' .env
    rm -f .env.tmp
    echo ""
    echo "✅ Updated FROM_EMAIL to: noreply@gemij.dpdns.org"
    ;;
  3)
    echo ""
    echo "To verify info@gemijjournal.online:"
    echo "1. Check inbox for info@gemijjournal.online"
    echo "2. Look for verification email from Mailjet"
    echo "3. Click the verification link"
    echo ""
    echo "Or verify manually at:"
    echo "https://app.mailjet.com/account/sender"
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "New configuration:"
grep "^FROM_EMAIL" .env
echo ""
echo "✅ Done! Restart your server:"
echo "   npm run dev"
echo ""
echo "Then test by triggering an email (e.g., password reset)"
