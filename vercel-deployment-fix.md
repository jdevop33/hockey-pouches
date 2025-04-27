# Vercel Deployment Fix

This file was created to help fix the Vercel deployment issue.

The issue was that the deployment was using an older commit (b68d306) which still had the dynamic imports with `ssr: false` in the server component.

We've fixed this by:

1. Moving all analytics scripts to the head section using Next.js's Script component
2. Using the suppressHydrationWarning attribute on the body tag
3. Removing all dynamic imports with ssr: false
4. Creating a new branch and merging it to trigger a new deployment

This should resolve the deployment issue.

## April 2025 Dependency Resolution Fix

Fixed deployment failure by downgrading React from v19.1.0 to v18.2.0 to resolve compatibility issues with Medusa.js packages that require React ^18.0.0 as a peer dependency.

1. Updated package.json to use React 18.2.0
2. Added .npmrc to ensure proper dependency resolution
3. Fixed linter warning in WholesaleApplicationForm.tsx for unused catch variable
