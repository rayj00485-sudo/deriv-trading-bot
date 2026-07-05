#!/bin/bash

# Installation script for Deriv Trading Bot
# Run this script to set up the bot environment

echo "🚀 Deriv Trading Bot - Setup Script"
echo "===================================="
echo ""

# Check Node.js
echo "📋 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  echo "📥 Download from: https://nodejs.org/"
  echo "   Requires version 18 or higher"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check npm
echo "📋 Checking npm installation..."
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm $NPM_VERSION found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Create .env
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✅ .env file created"
  echo "⚠️  Please edit .env with your Deriv credentials"
else
  echo "✅ .env file already exists"
fi
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Deriv credentials"
echo "2. Run: npm start"
echo ""
