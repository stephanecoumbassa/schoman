# PWA Icons for Schoman

All PWA icons have been generated from the logo.svg file using the create-icons.sh script.

## Generated Icons:
✓ pwa-192x192.png (192x192 pixels) - Standard PWA icon
✓ pwa-512x512.png (512x512 pixels) - Standard PWA icon
✓ pwa-maskable-192x192.png (192x192 pixels) - Maskable icon with safe zone
✓ pwa-maskable-512x512.png (512x512 pixels) - Maskable icon with safe zone
✓ apple-touch-icon.png (180x180 pixels) - iOS home screen icon
✓ screenshot-wide.png (1280x720 pixels) - Landscape screenshot (placeholder)
✓ screenshot-narrow.png (750x1334 pixels) - Portrait screenshot (placeholder)

## Regenerating Icons:
To regenerate all icons from the source logo, run:
```bash
./create-icons.sh
```

Requirements:
- librsvg2-bin (for rsvg-convert)
- imagemagick (for convert)

## Screenshots:
The screenshot files are currently placeholders. For production deployment, replace them with actual screenshots of the Schoman application:
- Take a landscape screenshot (1280x720) of the main dashboard
- Take a portrait screenshot (750x1334) of a key mobile view

## Customization:
To use a custom logo instead of the default Vue logo:
1. Replace ../src/assets/logo.svg with your custom logo
2. Run ./create-icons.sh to regenerate all icons
