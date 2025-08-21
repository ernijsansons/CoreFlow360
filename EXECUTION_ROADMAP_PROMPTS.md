# **COREFLOW360 EXECUTION ROADMAP - CLAUDE CODE PROMPTS**

*Complete Sequential Implementation Guide with Copy-Paste Ready Prompts*

---

## **HOW TO USE THIS ROADMAP**

1. **Start each session** by reading the EXECUTION_CHECKPOINT.md file
2. **Copy the prompt** for your current task directly into Claude Code
3. **Follow the prompt exactly** - it includes all context and validation steps
4. **Update checkpoint** after each task completion
5. **If session ends**, use the recovery instructions in each task

---

## **MASTER EXECUTION PRINCIPLES**

### **Claude Code Best Practices**
- **ALWAYS** read existing files before modifying them
- **NEVER** make changes without understanding the current implementation
- **TEST** after each atomic change
- **DOCUMENT** progress in EXECUTION_CHECKPOINT.md
- **BACKUP** critical files before major changes

### **Session Recovery Protocol**
```markdown
If starting a new session:
1. Read EXECUTION_CHECKPOINT.md to see current progress
2. Run: git status (to see what changed)
3. Run: npm run build (to verify system state)
4. Continue from the last incomplete task
```

---

# **PHASE 1: STRATEGIC FOUNDATION ALIGNMENT**
*Weeks 1-4 | Priority: CRITICAL | Investment: $52K*

---

## **WEEK 1: MESSAGING FOUNDATION**

### **PROMPT 1.1.1: CONSCIOUSNESS TERMINOLOGY ELIMINATION**
**Copy this entire prompt to Claude Code:**

```
I need to eliminate all "consciousness" terminology from the CoreFlow360 codebase and replace it with business-focused language. This is TASK 1.1.1 of the execution roadmap.

CONTEXT GATHERING FIRST:
1. Read CLAUDE.md completely to understand current consciousness terminology
2. Read and list all files in src/components/consciousness/ directory
3. Read src/lib/ai/consciousness-orchestrator.ts
4. Search for "consciousness", "transcendent", "emergence" across the codebase
5. Create a backup directory: backups/pre-terminology-change/

IMPLEMENTATION STEPS:

Step 1: Update CLAUDE.md
- Replace all consciousness terminology with business language:
  - "consciousness" → "business intelligence"
  - "intelligence emergence" → "smart automation"
  - "autonomous evolution" → "automated optimization"
  - "transcendent" → "advanced"
- Ensure the manifesto section focuses on multi-business management

Step 2: Rename and update consciousness directory
- Rename src/components/consciousness/ to src/components/business-intelligence/
- Update each component file:
  - ConsciousnessDashboard.tsx → BusinessIntelligenceDashboard.tsx
  - Update all class names and exports
- Update all imports across the codebase

Step 3: Update AI orchestrator
- Rename src/lib/ai/consciousness-orchestrator.ts to business-intelligence-orchestrator.ts
- Update class: ConsciousnessOrchestrator → BusinessIntelligenceOrchestrator
- Update methods to use business terminology

Step 4: Update all imports and references
- Find all files importing from consciousness components
- Update all import statements
- Update any text references in UI components

VALIDATION:
- Run: npm run build (should succeed)
- Run: npm run lint (should pass)
- Search for "consciousness" in src/ (should return 0 results)
- Test the application runs correctly

UPDATE CHECKPOINT:
Add to EXECUTION_CHECKPOINT.md:
- TASK_1.1.1_COMPLETE: [timestamp]
- Files modified: [list all files]
- Validation passed: YES/NO

Report back with the results of all changes and validations.
```

---

### **PROMPT 1.1.2: HOMEPAGE HERO SECTION TRANSFORMATION**
**Copy this entire prompt to Claude Code:**

```
I need to transform the homepage hero section to focus on multi-business empire building. This is TASK 1.1.2.

PREREQUISITE CHECK:
- Verify TASK_1.1.1 is complete in EXECUTION_CHECKPOINT.md
- If not complete, stop and complete 1.1.1 first

CONTEXT GATHERING:
1. Read src/app/page.tsx completely
2. Read src/components/home/HeroSection.tsx
3. Read src/components/home/CTASection.tsx
4. Check if ProgressivePricingPreview component exists
5. Backup current hero section

IMPLEMENTATION:

Step 1: Update HeroSection.tsx with new messaging
Create/update with this exact content:
- Headline: "Build Your Business Empire with Intelligence That Grows With You"
- Subheading: "The only platform designed for entrepreneurs managing multiple businesses - with progressive pricing that rewards portfolio growth"
- Add social proof metrics:
  - "500+ Multi-Business Entrepreneurs"
  - "$2.3M+ Saved Through Progressive Pricing"
  - "32% Average Efficiency Gain"
- CTA button: "Calculate Your Empire Savings"
- Secondary CTA: "See Portfolio Demo"

Step 2: Create ProgressivePricingPreview component
If it doesn't exist, create src/components/pricing/progressive/ProgressivePricingPreview.tsx:
- Business count selector (1-5+ businesses)
- Show progressive discount percentage
- Display effective price per user
- Show annual savings
- Interactive and responsive

Step 3: Integrate into homepage
- Import new components in src/app/page.tsx
- Ensure hero section is prominent
- Add progressive pricing preview above fold

VALIDATION:
- Start dev server: npm run dev
- Navigate to homepage
- Verify new headline is visible
- Test progressive pricing preview interaction
- Check responsive design on mobile
- All CTAs should work
- Run: npm run build (must succeed)

UPDATE CHECKPOINT:
- TASK_1.1.2_COMPLETE: [timestamp]
- Homepage hero transformed
- Progressive pricing preview integrated

Report results with screenshots if possible.
```

---

### **PROMPT 1.1.3: NAVIGATION STRUCTURE REDESIGN**
**Copy this entire prompt to Claude Code:**

```
I need to redesign the navigation structure for multi-business focus. This is TASK 1.1.3.

PREREQUISITE:
- Verify TASK_1.1.2 is complete

CONTEXT:
1. Read src/components/layout/Navbar.tsx completely
2. Read src/components/navigation/IntelligentNavigation.tsx if it exists
3. Check mobile navigation implementation
4. Note current navigation structure
5. Check if BusinessSwitcher component exists

IMPLEMENTATION:

Step 1: Update main navigation items
Replace current nav with:
- Portfolio Management (primary, highlighted)
- Progressive Pricing (with "Save 20-50%" badge)
- Multi-Business Tools (with dropdown)
- Success Stories
- Resources (with dropdown)

Step 2: Add persona-based navigation
Create secondary nav for:
- "I'm Building My First Empire"
- "I Have 2-3 Businesses" 
- "I Have 4+ Businesses"
- "I'm Acquiring Businesses"

Step 3: Make business switcher prominent
If user has multiple businesses:
- Add purple border and "Portfolio" label
- Show business count
- Include performance indicators

Step 4: Update mobile navigation
Ensure all navigation works on mobile devices

VALIDATION:
- Test all navigation links work
- Test dropdowns function correctly
- Test mobile navigation
- Verify business switcher prominence
- Check responsive behavior
- Run: npm run build

UPDATE CHECKPOINT:
- TASK_1.1.3_COMPLETE: [timestamp]
- Navigation restructured for multi-business focus

Report all changes made.
```

---

## **WEEK 2: PROGRESSIVE PRICING & UX**

### **PROMPT 1.1.4: PROGRESSIVE PRICING INTEGRATION**
**Copy this entire prompt to Claude Code:**

```
I need to integrate progressive pricing throughout the platform. This is TASK 1.1.4 - CRITICAL.

CONTEXT GATHERING (MUST DO FIRST):
1. Read src/lib/unified-pricing-engine.ts completely
2. Read src/components/pricing/progressive/ProgressivePricingCalculator.tsx
3. Check src/app/api/subscriptions/ directory structure
4. Check src/app/api/pricing/ directory
5. Understand current pricing implementation

IMPLEMENTATION:

Step 1: Verify/Fix Pricing Engine
In src/lib/unified-pricing-engine.ts:
- Ensure progressive discounts are: 1:0%, 2:20%, 3:35%, 4:45%, 5+:50%
- Add calculateProgressivePricing method if missing
- Add proper TypeScript types
- Include validation and error handling
- Add test cases for calculations

Step 2: Create Progressive Pricing API
Create src/app/api/pricing/progressive/route.ts:
- POST endpoint for pricing calculations
- Input validation with Zod
- Return detailed pricing breakdown
- Include business-by-business breakdown
- Add error handling and logging

Step 3: Integrate Calculator with API
Update ProgressivePricingCalculator component:
- Connect to new API endpoint
- Add loading states
- Add error handling
- Include lead capture functionality
- Add "Get Quote" and "See Demo" CTAs
- Make it interactive with sliders

Step 4: Add to main pricing page
- Import calculator into pricing page
- Make it prominent above fold
- Add supporting copy about savings
- Include case study examples

VALIDATION:
- Test API: curl -X POST http://localhost:3000/api/pricing/progressive -H "Content-Type: application/json" -d '{"businessCount": 3, "userCount": 10, "tier": "starter"}'
- Should return 35% discount for 3 businesses
- Test calculator with all business counts
- Verify calculations are correct
- Test responsive design
- Run: npm run build
- Run: npm test -- --grep "pricing"

UPDATE CHECKPOINT:
- TASK_1.1.4_COMPLETE: [timestamp]
- Progressive pricing fully integrated
- API endpoint working
- Calculator connected to backend

This is a CRITICAL task - ensure all calculations are correct.
```

---

### **PROMPT 1.1.5: MULTI-BUSINESS DASHBOARD PRIORITY**
**Copy this entire prompt to Claude Code:**

```
I need to make the portfolio dashboard the default view for multi-business users. This is TASK 1.1.5.

CONTEXT:
1. Read src/components/dashboard/ModernDashboard.tsx
2. Read src/components/multi-business/MultiBusinessCommandCenter.tsx
3. Check how dashboard routing works
4. Understand user session structure
5. Check BusinessSwitcher implementation

IMPLEMENTATION:

Step 1: Update dashboard logic
In ModernDashboard.tsx:
- Check if user has multiple businesses
- If yes, redirect to MultiBusinessCommandCenter
- If no, show single business dashboard

Step 2: Enhance Multi-Business Command Center
- Add portfolio performance metrics at top
- Show business comparison cards
- Add cross-business opportunities section
- Include consolidated KPIs
- Make business switching prominent

Step 3: Update BusinessSwitcher
- Add performance indicators for each business
- Show revenue and growth percentage
- Add quick actions menu
- Preserve context when switching

Step 4: Add breadcrumbs
- Show current business context clearly
- Allow easy navigation back to portfolio view

VALIDATION:
- Login with multi-business account
- Verify portfolio dashboard loads by default
- Test business switching
- Check performance indicators display
- Verify single-business users see normal dashboard
- Run: npm run build

UPDATE CHECKPOINT:
- TASK_1.1.5_COMPLETE: [timestamp]
- Portfolio dashboard set as default
- Multi-business UX improved

Report implementation details.
```

---

## **WEEK 1 VALIDATION PROMPT**

```
I need to validate all Week 1 tasks are complete. Run this comprehensive validation:

1. Build validation:
   - npm run build (must succeed)
   - npx tsc --noEmit (no TypeScript errors)

2. Terminology check:
   - Search for "consciousness" in src/
   - Should return 0 results

3. Homepage check:
   - Start dev server
   - Verify new hero messaging
   - Test progressive pricing preview

4. Navigation check:
   - Test all navigation items
   - Verify multi-business focus

5. Update EXECUTION_CHECKPOINT.md:
   - Add "WEEK_1_COMPLETE: [timestamp]"
   - List all completed tasks
   - Note any issues found

Report validation results.
```

---

# **PHASE 2: FEATURE INTEGRATION**
*Weeks 5-10 | Priority: HIGH | Investment: $78K*

---

## **WEEK 5-6: CROSS-BUSINESS WORKFLOWS**

### **PROMPT 2.1.1: CROSS-BUSINESS EMPLOYEE MANAGEMENT**
**Copy this entire prompt to Claude Code:**

```
I need to implement cross-business employee management. This is TASK 2.1.1 from Phase 2.

PREREQUISITE:
- Verify PHASE_1 is complete in EXECUTION_CHECKPOINT.md

CONTEXT GATHERING:
1. Read current employee management implementation
2. Check database schema for employees table
3. Understand multi-tenant architecture
4. Review time tracking implementation
5. Check payroll integration if exists

IMPLEMENTATION:

Step 1: Update database schema
Create migration for cross-business employees:
- Add business_assignments JSONB column to employees
- Create cross_business_assignments table
- Add allocation_percentage field
- Include role per business

Step 2: Create employee management components
Create src/components/hr/CrossBusinessEmployeeManagement.tsx:
- Employee assignment interface
- Business allocation percentages
- Role management per business
- Availability calendar across businesses

Step 3: Implement time tracking
- Allow time entry per business
- Calculate cost allocation
- Generate reports per business
- Show total hours across portfolio

Step 4: Create resource optimization
- Suggest optimal employee allocation
- Identify underutilized resources
- Recommend cross-training opportunities

VALIDATION:
- Test employee assignment to multiple businesses
- Verify time tracking allocation
- Check cost calculations
- Test reporting accuracy
- Run: npm test -- --grep "employee"

UPDATE CHECKPOINT:
- TASK_2.1.1_COMPLETE: [timestamp]
- Cross-business employee management implemented

Report implementation status.
```

---

### **PROMPT 2.1.2: UNIFIED CUSTOMER DATABASE**
**Copy this entire prompt to Claude Code:**

```
I need to implement a unified customer database with cross-business intelligence. This is TASK 2.1.2.

CONTEXT:
1. Read current CRM implementation
2. Check customer database schema
3. Understand customer relationship model
4. Review existing customer components
5. Check for AI integration points

IMPLEMENTATION:

Step 1: Update customer schema
- Add cross_business_relationships table
- Link customers across businesses
- Track interaction history per business
- Add portfolio_value field

Step 2: Create portfolio customer view
Create src/components/crm/CustomerPortfolioView.tsx:
- Show customer across all businesses
- Display total portfolio value
- Show purchase history timeline
- Identify cross-sell opportunities

Step 3: Implement opportunity detection
- AI-powered cross-sell scoring
- Automatic opportunity creation
- Suggested actions per customer
- Success probability calculation

Step 4: Create unified communication
- Centralized communication history
- Cross-business notes and activities
- Automated follow-up suggestions

VALIDATION:
- Test customer linking across businesses
- Verify portfolio value calculations
- Test opportunity detection
- Check communication history
- Run integration tests

UPDATE CHECKPOINT:
- TASK_2.1.2_COMPLETE: [timestamp]
- Unified customer database implemented

Report results.
```

---

## **WEEK 7-8: INDUSTRY SPECIALIZATIONS**

### **PROMPT 2.2.1: HVAC MULTI-LOCATION FEATURES**
**Copy this entire prompt to Claude Code:**

```
I need to implement HVAC-specific multi-location features. This is TASK 2.2.1.

CONTEXT:
1. Read src/components/hvac/ directory if exists
2. Check for route optimization implementations
3. Review inventory management features
4. Understand dispatch system if exists
5. Check for seasonal planning features

IMPLEMENTATION:

Step 1: Create HVAC empire manager
Create src/components/hvac/HVACEmpireManager.tsx:
- Multi-location dashboard
- Cross-location resource sharing
- Unified dispatch system
- Equipment tracking across locations

Step 2: Implement route optimization
- Multi-location route planning
- Technician allocation optimization
- Drive time minimization
- Emergency call prioritization

Step 3: Add inventory sharing
- Cross-location parts availability
- Automatic transfer suggestions
- Bulk ordering optimization
- Equipment sharing calendar

Step 4: Create seasonal optimization
- Workforce planning for peak seasons
- Cross-training recommendations
- Revenue forecasting per location

VALIDATION:
- Test multi-location features
- Verify route optimization
- Check inventory sharing logic
- Test seasonal planning
- Run HVAC-specific tests

UPDATE CHECKPOINT:
- TASK_2.2.1_COMPLETE: [timestamp]
- HVAC multi-location features complete

Report implementation.
```

---

# **PHASE 3: MARKETING & LEAD GENERATION**
*Weeks 11-16 | Priority: MEDIUM | Investment: $95K*

---

## **WEEK 11-12: CONTENT & SEO**

### **PROMPT 3.1.1: MULTI-BUSINESS SEO CONTENT STRATEGY**
**Copy this entire prompt to Claude Code:**

```
I need to implement SEO-optimized content for multi-business management. This is TASK 3.1.1.

CONTEXT:
1. Check current blog implementation
2. Review SEO setup (meta tags, sitemap)
3. Check content management approach
4. Review analytics integration
5. Understand URL structure

IMPLEMENTATION:

Step 1: Create blog post templates
Create content for these topics:
- "The Ultimate Guide to Multi-Business Management"
- "How to Manage Multiple Businesses Without Losing Your Mind"
- "Progressive Pricing vs Traditional Software Costs"
- "Building Your Business Empire: Complete Guide"

Step 2: Optimize for SEO
- Add meta descriptions
- Include structured data
- Optimize headings (H1, H2, H3)
- Add internal linking
- Include relevant keywords

Step 3: Create landing pages
Build pages for:
- /multi-business-management
- /serial-entrepreneurs
- /business-portfolio-software
- /progressive-pricing

Step 4: Update sitemap
- Include all new pages
- Set proper priorities
- Add change frequencies

VALIDATION:
- Check all pages load correctly
- Verify meta tags are present
- Test structured data
- Check mobile responsiveness
- Run SEO audit tool

UPDATE CHECKPOINT:
- TASK_3.1.1_COMPLETE: [timestamp]
- SEO content strategy implemented

Report SEO improvements.
```

---

### **PROMPT 3.1.2: CASE STUDY DEVELOPMENT**
**Copy this entire prompt to Claude Code:**

```
I need to create multi-business entrepreneur case studies. This is TASK 3.1.2.

CONTEXT:
1. Check for existing case studies
2. Review testimonial components
3. Check video integration capabilities
4. Review current customer stories
5. Understand media handling

IMPLEMENTATION:

Step 1: Create case study template
Design template with:
- Customer background
- Challenges faced
- Solution implementation
- Results achieved
- ROI metrics
- Future plans

Step 2: Build case study pages
Create 3 case studies:
1. "Sarah's 4-Restaurant Empire"
   - From 1 to 4 locations in 2 years
   - $28,000 annual savings
   - 35% efficiency improvement

2. "Mike's HVAC & Landscaping Portfolio"
   - 2 different business types
   - Cross-selling success
   - 45% revenue increase

3. "Legal & Accounting Practice Group"
   - Professional services portfolio
   - Resource sharing benefits
   - 50% overhead reduction

Step 3: Add video testimonials
- Embed video players
- Add transcripts for SEO
- Include key quotes as pullouts

VALIDATION:
- Test all case study pages
- Verify metrics display correctly
- Check video playback
- Test responsive design
- Verify SEO optimization

UPDATE CHECKPOINT:
- TASK_3.1.2_COMPLETE: [timestamp]
- Case studies created and published

Report completion.
```

---

# **PHASE 4: ADVANCED FEATURES & SCALE**
*Weeks 17-24 | Priority: LOW | Investment: $125K*

---

## **WEEK 17-20: AI PORTFOLIO OPTIMIZATION**

### **PROMPT 4.1.1: PORTFOLIO INTELLIGENCE ENGINE**
**Copy this entire prompt to Claude Code:**

```
I need to implement AI-powered portfolio optimization. This is TASK 4.1.1 from Phase 4.

PREREQUISITE:
- Verify Phases 1-3 are complete

CONTEXT:
1. Review AI integration architecture
2. Check available AI providers
3. Understand portfolio data structure
4. Review analytics implementation
5. Check ML pipeline if exists

IMPLEMENTATION:

Step 1: Create portfolio analyzer
Build AI analysis for:
- Performance comparison across businesses
- Trend identification
- Anomaly detection
- Opportunity identification

Step 2: Implement recommendations
- Resource allocation suggestions
- Investment prioritization
- Risk assessment
- Growth opportunity scoring

Step 3: Add predictive analytics
- Revenue forecasting
- Cash flow predictions
- Market trend analysis
- Seasonal adjustments

Step 4: Create optimization dashboard
- Visual recommendations
- Action priority queue
- Impact projections
- Success tracking

VALIDATION:
- Test AI recommendations
- Verify prediction accuracy
- Check dashboard functionality
- Test with various portfolio sizes
- Run ML pipeline tests

UPDATE CHECKPOINT:
- TASK_4.1.1_COMPLETE: [timestamp]
- AI portfolio optimization implemented

Report AI capabilities added.
```

---

## **RECOVERY PROCEDURES**

### **SESSION RECOVERY PROMPT**
**Use this if Claude Code session ends unexpectedly:**

```
I need to recover from a terminated session and continue the execution roadmap.

RECOVERY STEPS:
1. Read EXECUTION_CHECKPOINT.md and tell me the last completed task
2. Run: git status (show me what files changed)
3. Run: npm run build (verify system still builds)
4. Tell me if there are any uncommitted changes
5. Identify the next task to complete from the roadmap

Based on findings:
- If build fails, fix errors first
- If changes are incomplete, complete current task
- If task is complete but not marked, update checkpoint
- Then proceed with next task in sequence

Report current status and recommended next action.
```

---

## **VALIDATION PROCEDURES**

### **DAILY VALIDATION PROMPT**
```
Run daily validation of all changes:

1. System health:
   - npm run build
   - npm run lint
   - npm test

2. Check progress:
   - Read EXECUTION_CHECKPOINT.md
   - List completed tasks today
   - Identify any blockers

3. Git status:
   - Show uncommitted changes
   - Suggest logical commit points

4. Next tasks:
   - Identify next 3 tasks
   - Check dependencies
   - Estimate completion time

Report validation results and daily progress.
```

---

## **WEEKLY CHECKPOINT PROMPT**
```
Perform weekly checkpoint validation:

1. Run comprehensive tests:
   - npm run build
   - npm test
   - npm run lint
   - Check for TypeScript errors

2. Review progress:
   - List all tasks completed this week
   - Calculate completion percentage
   - Identify any delayed tasks

3. Update documentation:
   - Update EXECUTION_CHECKPOINT.md with weekly summary
   - Document any issues encountered
   - Note any deviations from plan

4. Prepare next week:
   - List next week's tasks
   - Identify dependencies
   - Flag any potential blockers

Generate weekly progress report.
```

---

## **EMERGENCY PROCEDURES**

### **CRITICAL ERROR RECOVERY**
```
CRITICAL ERROR - System won't build. Execute recovery:

1. Identify error:
   - Show full error message
   - Identify affected files
   - Determine error type

2. Create backup:
   - mkdir backups/emergency-$(date +%s)
   - Copy affected files to backup

3. Attempt fixes:
   - If import error: fix import statements
   - If type error: fix TypeScript types
   - If missing file: restore from backup
   - If dependency issue: npm install

4. Validate fix:
   - npm run build
   - npm test affected components
   - Verify functionality

5. Document:
   - Add error and fix to EXECUTION_CHECKPOINT.md
   - Create prevention note

Report recovery status.
```

---

## **COMPLETION CRITERIA**

### **PHASE COMPLETION PROMPT**
```
Validate phase completion before moving to next phase:

For Phase [NUMBER]:
1. Verify all tasks marked complete in EXECUTION_CHECKPOINT.md
2. Run full test suite
3. Check all success metrics are met
4. Validate all integrations working
5. Perform user acceptance testing
6. Document any outstanding issues

Generate phase completion report with:
- Tasks completed
- Metrics achieved
- Issues remaining
- Recommendations for next phase

Confirm phase is complete and ready to proceed.
```

---

## **NOTES FOR CLAUDE CODE**

1. **Always start** by reading EXECUTION_CHECKPOINT.md
2. **Never skip** context gathering steps
3. **Test after** every implementation step
4. **Document everything** in checkpoint file
5. **Ask for clarification** if anything is unclear
6. **Report errors** immediately - don't try to hide them
7. **Validate thoroughly** before marking tasks complete

This roadmap is designed for systematic, error-free execution with full recovery capabilities.