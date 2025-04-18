# OpenGraph Images for Social Media Sharing

This directory contains files for generating and storing OpenGraph images used when sharing your website on social media platforms like Facebook, Twitter, and LinkedIn.

## Files in this Directory

- `hockey-logo.png` - The logo used in OpenGraph images
- `hockey-pouches-og.png` - The main OpenGraph image used for social sharing
- `create-og-image.html` - A tool to help you create a proper OpenGraph image
- `og-template.html` - A template for creating OpenGraph images

## How to Create a New OpenGraph Image

1. Open the `create-og-image.html` file in your browser
   - You can run `node scripts/generate-og-image.js` to open it automatically
   
2. Take a screenshot of the image shown (1200×630 pixels)
   - Use your browser's screenshot tool or an OS screenshot utility
   - Make sure to capture exactly 1200×630 pixels for optimal display

3. Save the screenshot as `hockey-pouches-og.png` in this directory

4. Update the `app/layout.tsx` file to use this new image for OpenGraph and Twitter cards

## Best Practices for OpenGraph Images

- Use a 1200×630 pixel image (aspect ratio of 1.91:1)
- Keep important content in the center (platforms may crop the edges)
- Use high contrast for better visibility
- Include your logo and a short, clear message
- Test your image on various platforms using tools like [OpenGraph Checker](https://www.opengraph.xyz/)

## Troubleshooting

If your OpenGraph image isn't showing up correctly when sharing:

1. Make sure the image is properly referenced in `app/layout.tsx`
2. Check that the image is accessible at the correct URL
3. Use Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) or Twitter's [Card Validator](https://cards-dev.twitter.com/validator) to diagnose issues
4. Clear the cache on the social platform by re-scraping the URL
