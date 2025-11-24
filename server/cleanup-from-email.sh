#!/bin/bash

echo "Cleaning up duplicate FROM_EMAIL and FROM_NAME entries in .env..."
echo ""

# Backup first
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ Backup created"

# Show current duplicates
echo ""
echo "Current entries:"
echo "----------------"
grep -n "^FROM_EMAIL\|^FROM_NAME" .env

echo ""
echo "Which FROM_EMAIL do you want to keep?"
echo "1) mail@ahamednazeer.qzz.io (line 21)"
echo "2) info@gemijjournal.online (line 33)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  # Keep first, remove second
  sed -i.tmp '33s/^FROM_EMAIL=/#FROM_EMAIL=/' .env
  sed -i.tmp '34s/^FROM_NAME=/#FROM_NAME=/' .env
  echo ""
  echo "✓ Keeping mail@ahamednazeer.qzz.io"
  echo "✓ Commented out info@gemijjournal.online"
elif [ "$choice" = "2" ]; then
  # Keep second, remove first
  sed -i.tmp '21s/^FROM_EMAIL=/#FROM_EMAIL=/' .env
  sed -i.tmp '22s/^FROM_NAME=/#FROM_NAME=/' .env
  echo ""
  echo "✓ Keeping info@gemijjournal.online"
  echo "✓ Commented out mail@ahamednazeer.qzz.io"
else
  echo "Invalid choice. No changes made."
  exit 1
fi

rm -f .env.tmp

echo ""
echo "Updated entries:"
echo "----------------"
grep -n "FROM_EMAIL\|FROM_NAME" .env

echo ""
echo "✅ Done! Restart your server to apply changes:"
echo "   npm run dev"
