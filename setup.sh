#!/bin/bash

echo "🏠 Dudley Family Site Setup Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/ first"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing root dependencies..."
npm install

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Installing worker dependencies..."
cd ../worker
npm install

cd ..

echo "✅ All dependencies installed!"

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI ready"

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Run: wrangler login"
echo "2. Run: wrangler d1 create dudley-family-db"
echo "3. Run: wrangler r2 bucket create dudley-family-photos"
echo "4. Update the database ID in worker/wrangler.toml"
echo "5. Run: wrangler d1 execute dudley-family-db --file=./worker/schema.sql"
echo "6. Run: wrangler deploy (from worker directory)"
echo ""
echo "For development, run: npm run dev"
