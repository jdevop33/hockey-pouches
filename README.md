# Hockey Puxx - Nicotine Tins

A Next.js e-commerce website for Hockey Puxx nicotine pouches, targeting the Canadian market. Built with Next.js 15 and Tailwind CSS v4.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - A React framework with hybrid static & server rendering
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - A utility-first CSS framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- **Analytics**:
  - Google Analytics (GA4)
  - Microsoft Clarity
  - Vercel Analytics
- **Form Handling**:
  - React Hook Form
  - HeroTofu for form submissions

## Project Structure

- `/app`: Next.js App Router structure
  - `/components`: Reusable components
    - `/layout`: Layout components including the main Layout component
    - `/ui`: UI components like buttons, forms, etc.
  - `/data`: Data files including product data
  - `/_components`: Client components for analytics and other functionality
  - Various page directories for each route
- `/public`: Static assets including images
- `/scripts`: Utility scripts for development and deployment

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jdevop33/hockey-pouches.git
   cd hockey-pouches
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_BASE_URL=https://nicotinetins.com
   NEXT_PUBLIC_CONTACT_EMAIL=info@nicotinetins.com
   NEXT_PUBLIC_SITE_NAME=Nicotine Tins
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-PMM01WKF05
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run build:no-lint` - Build without linting (faster)
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm run deploy` - Deploy to Vercel
- `npm run git:push` - Push code to GitHub

## Deployment

The site is deployed on Vercel. The production site is available at [https://nicotinetins.com](https://nicotinetins.com).

### Deployment Process

1. Commit your changes to the repository
2. Push to GitHub:
   ```bash
   npm run git:push
   ```
3. Deploy to Vercel:
   ```bash
   npm run deploy
   ```

## Best Practices

- Use TypeScript for type safety
- Follow the Next.js App Router patterns
- Use Tailwind CSS for styling
- Keep components small and focused
- Use client components only when necessary
- Optimize images using Next.js Image component
- Follow accessibility guidelines
- The main layout component is in `/app/components/layout/Layout.tsx`
- Product data is stored in `/app/data/products.ts`

## Notes

- ESLint is configured to warn about unused variables
- The project uses Next.js App Router for routing
- Analytics are configured in the layout.tsx file
- Structured data is implemented for SEO
