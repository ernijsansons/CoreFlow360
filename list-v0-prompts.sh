#!/bin/bash

# CoreFlow360 V0 Prompts Listing
# This script lists all V0 prompts with their file paths for easy access

echo "🎨 CoreFlow360 V0.dev Prompts"
echo "=============================="
echo ""
echo "Project ID: W86gMvTu2Qs"
echo "V0.dev URL: https://v0.dev"
echo ""
echo "Available Prompts:"
echo ""

cd v0-prompts

for file in *.md; do
    if [ -f "$file" ]; then
        title=$(head -n 1 "$file" | sed 's/# //')
        echo "📄 $file"
        echo "   Title: $title"
        echo "   Path: v0-prompts/$file"
        echo ""
    fi
done

echo ""
echo "To use these prompts:"
echo "1. Go to https://v0.dev"
echo "2. Click 'New' to create a new component"
echo "3. Copy the content from any prompt file above"
echo "4. Paste into V0.dev and generate"
echo "5. Save the generated component to your project"