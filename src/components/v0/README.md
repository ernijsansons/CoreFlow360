# V0.dev Components Integration

This directory contains UI components generated from v0.dev that provide the visual design for CoreFlow360.

## How to Add V0 Components

1. **From v0.dev Website**:
   - Go to your v0.dev project
   - Copy the component code
   - Create a new file here with the component name (e.g., `HeroSection.tsx`)
   - Paste the code and save

2. **From v0-coreflow360 Project**:
   - Access your v0-coreflow360 Vercel project
   - Download the source files
   - Copy components to this directory
   - Update imports as needed

## Component Structure

```
src/components/v0/
├── landing/          # Landing page components
│   ├── HeroSection.tsx
│   ├── Features.tsx
│   └── Pricing.tsx
├── dashboard/        # Dashboard UI components
│   ├── Stats.tsx
│   └── Charts.tsx
└── shared/          # Shared UI elements
    ├── Button.tsx
    └── Card.tsx
```

## Usage Example

```tsx
import { HeroSection } from '@/components/v0/landing/HeroSection'

export default function HomePage() {
  return <HeroSection />
}
```

## Important Notes

- V0 components use Tailwind CSS and shadcn/ui
- Ensure all dependencies are installed
- Components may need adjustment for TypeScript strict mode
- Update imports to match your project structure