#!/bin/bash
# Script to generate PWA icons from the logo SVG file

# Check if required tools are installed
if ! command -v rsvg-convert &> /dev/null; then
    echo "Error: rsvg-convert is not installed. Install it with:"
    echo "  sudo apt install librsvg2-bin"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick convert is not installed. Install it with:"
    echo "  sudo apt install imagemagick"
    exit 1
fi

echo "Generating PWA icons from logo.svg..."

# 192x192 icon
rsvg-convert -w 192 -h 192 ../src/assets/logo.svg -o pwa-192x192.png
echo "✓ Created pwa-192x192.png"

# 512x512 icon  
rsvg-convert -w 512 -h 512 ../src/assets/logo.svg -o pwa-512x512.png
echo "✓ Created pwa-512x512.png"

# 180x180 apple touch icon
rsvg-convert -w 180 -h 180 ../src/assets/logo.svg -o apple-touch-icon.png
echo "✓ Created apple-touch-icon.png"

# For maskable icons, we need to add padding to ensure the icon is safe within the maskable area
# Maskable icons need 40% safe zone, so we'll scale the logo down and center it with padding
rsvg-convert -w 144 -h 144 ../src/assets/logo.svg -o temp-144.png
convert temp-144.png -gravity center -background transparent -extent 192x192 pwa-maskable-192x192.png
rm temp-144.png
echo "✓ Created pwa-maskable-192x192.png"

rsvg-convert -w 384 -h 384 ../src/assets/logo.svg -o temp-384.png
convert temp-384.png -gravity center -background transparent -extent 512x512 pwa-maskable-512x512.png
rm temp-384.png
echo "✓ Created pwa-maskable-512x512.png"

# Create placeholder screenshots (replace with actual app screenshots)
convert -size 1280x720 xc:white -font DejaVu-Sans -pointsize 48 -fill "#41b883" -gravity center -annotate +0+0 "Schoman\nSchool Management System" screenshot-wide.png
echo "✓ Created screenshot-wide.png (placeholder - replace with actual screenshot)"

convert -size 750x1334 xc:white -font DejaVu-Sans -pointsize 48 -fill "#41b883" -gravity center -annotate +0+0 "Schoman\nSchool Management\nSystem" screenshot-narrow.png
echo "✓ Created screenshot-narrow.png (placeholder - replace with actual screenshot)"

echo ""
echo "All PWA icons generated successfully!"
echo ""
echo "Note: Screenshot placeholders created. For production, replace with actual app screenshots:"
echo "  - screenshot-wide.png: 1280x720 landscape screenshot"
echo "  - screenshot-narrow.png: 750x1334 portrait screenshot"
