#!/bin/bash

# Development server management script
echo "🚀 Starting optimized development server..."

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Clean build cache
rm -rf .next

# Start development server with optimized settings
npm run dev
