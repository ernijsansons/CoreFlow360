// v0-website-generator.js
import fs from 'fs-extra';
import chalk from 'chalk';

class V0WebsiteGenerator {
  async generatePrompts() {
    console.log(chalk.cyan('\n🎨 Generating V0.dev Website Prompts...\n'));
    
    // Load feature analysis
    const features = await fs.readJson('./analysis/features.json');
    
    const prompts = [
      {
        component: 'Hero Section',
        prompt: `Create a stunning hero section for CoreFlow360 - ${features.tagline}. 
Use Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.
Design: Futuristic consciousness theme with particle effects, gradient mesh background (blue to purple), 
glassmorphism cards floating in 3D space. Include:
- Animated headline: "${features.tagline}"
- Subheading with typewriter effect
- Two CTAs: "Start Free Trial" (primary) and "Watch Demo" (secondary with play icon)
- Floating feature cards that respond to mouse movement
- Background: Animated neural network pattern
- Mobile responsive with reduced animations
Style: Dark mode first, accent color #00ff88, smooth animations.
Temperature: 0.1`
      },
      {
        component: 'Industry Showcase',
        prompt: `Create an industry switcher showcase section showing CoreFlow360's multi-industry capabilities.
Use Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.
Design: Interactive carousel with 3D card flip animations. Each industry card shows:
- Industry icon and name (HVAC, Construction, Healthcare, Legal, Consulting)
- Key features for that industry (3-4 bullet points)
- "See Demo" button
- Active card expands with more details
Include industry toggle at top that filters the view.
Animations: Cards float in on scroll, smooth transitions between industries.
Style: Glassmorphism cards, gradient borders, dark background.
Temperature: 0.1`
      },
      {
        component: 'AI Features Grid',
        prompt: `Create an AI features showcase grid for CoreFlow360's AI capabilities.
Use Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.
Layout: Bento grid style with different sized cards:
- Large card: "AI SDR" with animated chat simulation
- Medium cards: "Predictive Analytics" with live graph, "Multi-Provider AI" with provider logos
- Small cards: Quick AI features
Each card has:
- Gradient background
- Hover effect that reveals more info
- Micro-animations (pulsing dots, moving gradients)
- Icon with glow effect
Include "Powered by GPT-4, Claude, and Gemini" badge.
Style: Cyberpunk aesthetic, neon accents, dark theme.
Temperature: 0.1`
      },
      {
        component: 'Consciousness Dashboard Preview',
        prompt: `Create a product preview section showing CoreFlow360's Quantum Evolution Dashboard.
Use Next.js 14, TypeScript, Tailwind CSS, Recharts, and Three.js for 3D elements.
Design: Full-width section with perspective tilt effect. Show dashboard mockup with:
- 3D floating metrics cards
- Animated line graphs showing business growth
- Consciousness level indicator (circular progress)
- Real-time activity feed
- Particle effects connecting different elements
Include text: "Experience Business Intelligence That Thinks"
Animations: Dashboard elements fade in sequentially, graphs animate data.
Style: Holographic UI elements, depth blur, premium feel.
Temperature: 0.1`
      },
      {
        component: 'Pricing Section',
        prompt: `Create a premium pricing section for CoreFlow360 with 3 tiers.
Use Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.
Tiers: Starter ($299/mo), Professional ($699/mo - highlighted), Enterprise (Custom)
Design: Floating cards with glassmorphism, gradient borders, hover animations.
Each card includes:
- Plan name with gradient text
- Price with "/month" subtext
- Feature list with checkmarks (Lucide icons)
- CTA button (glow effect on hover)
- "Most Popular" badge on Professional
Special: Enterprise card has "Book Demo" instead of price.
Background: Subtle animated gradient mesh.
Style: Premium SaaS aesthetic, dark theme, smooth shadows.
Temperature: 0.1`
      },
      {
        component: 'Footer with Newsletter',
        prompt: `Create a modern footer with newsletter signup for CoreFlow360.
Use Next.js 14, TypeScript, Tailwind CSS.
Layout: Multi-column with:
- Company info and logo
- Product links (Features, Industries, Pricing, API)
- Resources (Documentation, Blog, Support)
- Legal (Privacy, Terms, Security)
- Newsletter signup with glassmorphism input
Include: Social media icons, "Built with ❤️ and AI" tagline.
Style: Gradient border top, dark background, hover effects on all links.
Temperature: 0.1`
      }
    ];
    
    // Save prompts
    await fs.ensureDir('./v0-prompts');
    for (const [index, prompt] of prompts.entries()) {
      await fs.writeFile(
        `./v0-prompts/${index + 1}-${prompt.component.toLowerCase().replace(/\s+/g, '-')}.txt`,
        prompt.prompt
      );
    }
    
    console.log(chalk.green('✅ Generated 6 V0.dev prompts!'));
    console.log(chalk.dim('📁 Saved to: ./v0-prompts/'));
    
    // Create implementation guide
    const guide = `# CoreFlow360 Website Implementation Guide

## V0.dev Prompts Generated:
${prompts.map((p, i) => `${i + 1}. ${p.component}`).join('\n')}

## How to Use:
1. Go to v0.dev
2. Copy each prompt from the v0-prompts folder
3. Generate the component
4. Save to your Next.js project

## Project Structure:
\`\`\`
app/
├── page.tsx (Hero + main sections)
├── components/
│   ├── HeroSection.tsx
│   ├── IndustryShowcase.tsx
│   ├── AIFeaturesGrid.tsx
│   ├── DashboardPreview.tsx
│   ├── PricingSection.tsx
│   └── Footer.tsx
\`\`\`

## Color Palette:
- Primary: #00ff88 (Neon Green)
- Secondary: #8B5CF6 (Purple)
- Background: #0A0A0A (Near Black)
- Card Background: rgba(255, 255, 255, 0.05)
- Text: #FFFFFF, #A0A0A0

## Key Features to Highlight:
${features.uniqueValue.map(v => `- ${v}`).join('\n')}
`;
    
    await fs.writeFile('./v0-prompts/README.md', guide);
    console.log(chalk.cyan('\n📚 Implementation guide created!'));
  }
}

// Run generator
const generator = new V0WebsiteGenerator();
generator.generatePrompts();
