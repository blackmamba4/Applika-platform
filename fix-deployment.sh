#!/bin/bash

# Deployment Fix Script for Applika Platform
echo "🔧 Fixing deployment issues..."

# Clean install (this will handle Playwright properly)
echo "🧹 Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json .next
npm install

# Build test
echo "🏗️ Testing build..."
npm run build

echo "✅ Deployment fixes complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Commit these changes: git add . && git commit -m 'Fix deployment issues'"
echo "2. Push to your repository: git push"
echo "3. Redeploy your app"
echo "4. Test that it works"
echo "5. Set up Google Analytics once deployed"
echo ""
echo "📝 Note: Playwright is included but disabled by default."
echo "   Set SCRAPE_USE_PLAYWRIGHT=true to enable it if needed."
