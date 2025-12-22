#!/bin/bash

# Quick Setup Script for AI Backend

echo "🤖 AI Quick Add Backend Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file first."
    exit 1
fi

# Check if API key is configured
if grep -q "GOOGLE_AI_API_KEY=" .env.local; then
    echo "✅ GOOGLE_AI_API_KEY found in .env.local"
else
    echo "⚠️  GOOGLE_AI_API_KEY not found in .env.local"
    echo ""
    echo "Please add your Google AI API Key:"
    echo "1. Get API key from: https://aistudio.google.com/apikey"
    echo "2. Add to .env.local:"
    echo "   GOOGLE_AI_API_KEY=your_api_key_here"
    echo ""
    read -p "Do you want to add it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your API key: " api_key
        echo "" >> .env.local
        echo "# Google AI (Gemini)" >> .env.local
        echo "GOOGLE_AI_API_KEY=$api_key" >> .env.local
        echo "✅ API key added to .env.local"
    else
        echo "Setup cancelled. Please add API key manually."
        exit 1
    fi
fi

echo ""
echo "🧪 Testing AI connection..."
response=$(curl -s http://localhost:3000/api/ai/parse)
status=$(echo $response | jq -r '.status')

if [ "$status" = "connected" ]; then
    echo "✅ AI Backend is connected and ready!"
    echo ""
    echo "📝 Test parsing:"
    echo "curl -X POST http://localhost:3000/api/ai/parse \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"text\": \"beli dada ayam mentah 19 rb kemarin\"}' \\"
    echo "  | jq"
else
    echo "⚠️  AI Backend connection failed"
    echo "Status: $status"
    echo ""
    echo "Troubleshooting:"
    echo "1. Make sure dev server is running: npm run dev"
    echo "2. Check API key is valid"
    echo "3. Restart dev server after adding API key"
fi

echo ""
echo "📖 Full documentation: AI_QUICK_ADD.md"
