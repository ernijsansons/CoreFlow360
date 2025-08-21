const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Validating Strategic Transformation...\n');

let issues = [];
let successes = [];

// Check 1: No consciousness terminology remains
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**'] });
let consciousnessCount = 0;
let consciousnessFiles = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('consciousness') && !content.includes('business-intelligence')) {
    consciousnessCount++;
    consciousnessFiles.push(file);
  }
});

if (consciousnessCount === 0) {
  successes.push('✅ All consciousness terminology removed');
} else {
  issues.push(`❌ ${consciousnessCount} files still contain 'consciousness' terminology`);
  consciousnessFiles.slice(0, 5).forEach(f => {
    issues.push(`   - ${f}`);
  });
}

// Check 2: Progressive pricing integrated
if (fs.existsSync('src/app/pricing/progressive/page.tsx')) {
  successes.push('✅ Progressive pricing page exists');
} else {
  issues.push('❌ Progressive pricing page missing');
}

if (fs.existsSync('src/app/api/pricing/progressive/route.ts')) {
  successes.push('✅ Progressive pricing API exists');
} else {
  issues.push('❌ Progressive pricing API missing');
}

if (fs.existsSync('src/components/pricing/progressive/ProgressivePricingCalculator.tsx')) {
  successes.push('✅ Progressive pricing calculator exists');
} else {
  issues.push('❌ Progressive pricing calculator missing');
}

// Check 3: Industry pages exist
const industries = ['hvac', 'professional-services', 'construction'];
industries.forEach(industry => {
  const pagePath = `src/app/industries/${industry}/page.tsx`;
  if (fs.existsSync(pagePath)) {
    successes.push(`✅ ${industry} industry page exists`);
  } else {
    issues.push(`❌ ${industry} industry page missing`);
  }
});

// Check 4: AI components integrated
if (fs.existsSync('src/app/ai/page.tsx')) {
  successes.push('✅ AI Command Center page exists');
} else {
  issues.push('❌ AI Command Center page missing');
}

if (fs.existsSync('src/components/ai/business-coach/BusinessCoachDashboard.tsx')) {
  successes.push('✅ Business Coach Dashboard exists');
} else {
  issues.push('❌ Business Coach Dashboard missing');
}

if (fs.existsSync('src/components/ai/SimpleAIManager.tsx')) {
  successes.push('✅ Simple AI Manager exists');
} else {
  issues.push('❌ Simple AI Manager missing');
}

// Check 5: Multi-business components
const multiBusinessComponents = [
  'src/components/multi-business/MultiBusinessCommandCenter.tsx',
  'src/components/multi-business/BusinessSwitcher.tsx',
  'src/components/multi-business/AddBusinessWizard.tsx',
  'src/components/multi-business/ProgressivePricingShowcase.tsx'
];

multiBusinessComponents.forEach(component => {
  if (fs.existsSync(component)) {
    successes.push(`✅ ${path.basename(component)} exists`);
  } else {
    issues.push(`❌ ${path.basename(component)} missing`);
  }
});

// Check 6: Homepage integration
if (fs.existsSync('src/components/home/MultiBusinessShowcase.tsx')) {
  successes.push('✅ MultiBusinessShowcase component exists');
} else {
  issues.push('❌ MultiBusinessShowcase component missing');
}

if (fs.existsSync('src/components/home/ProgressivePricingPreview.tsx')) {
  successes.push('✅ ProgressivePricingPreview component exists');
} else {
  issues.push('❌ ProgressivePricingPreview component missing');
}

if (fs.existsSync('src/components/home/AIFeaturesShowcase.tsx')) {
  successes.push('✅ AIFeaturesShowcase component exists');
} else {
  issues.push('❌ AIFeaturesShowcase component missing');
}

// Check 7: Check main app page integration
const appPage = fs.readFileSync('src/app/page.tsx', 'utf8');
if (appPage.includes('MultiBusinessShowcase')) {
  successes.push('✅ MultiBusinessShowcase integrated in homepage');
} else {
  issues.push('❌ MultiBusinessShowcase not integrated in homepage');
}

if (appPage.includes('ProgressivePricingPreview')) {
  successes.push('✅ ProgressivePricingPreview integrated in homepage');
} else {
  issues.push('❌ ProgressivePricingPreview not integrated in homepage');
}

if (appPage.includes('AIFeaturesShowcase')) {
  successes.push('✅ AIFeaturesShowcase integrated in homepage');
} else {
  issues.push('❌ AIFeaturesShowcase not integrated in homepage');
}

// Print results
console.log('=' .repeat(80));
console.log('VALIDATION RESULTS');
console.log('=' .repeat(80));
console.log('\n✅ SUCCESS ITEMS:', successes.length);
successes.forEach(s => console.log(s));

console.log('\n❌ ISSUES FOUND:', issues.length);
if (issues.length > 0) {
  issues.forEach(i => console.log(i));
}

console.log('\n' + '=' .repeat(80));

// Final assessment
const totalChecks = successes.length + issues.length;
const successRate = Math.round((successes.length / totalChecks) * 100);

if (issues.length === 0) {
  console.log('🎉 TRANSFORMATION COMPLETE! All checks passed!');
  console.log(`Success Rate: ${successRate}%`);
} else {
  console.log(`⚠️ TRANSFORMATION INCOMPLETE! ${issues.length} issues need attention.`);
  console.log(`Success Rate: ${successRate}%`);
  
  if (consciousnessCount > 0) {
    console.log('\n📋 ACTION REQUIRED:');
    console.log('Run the messaging transformation script to remove consciousness terminology.');
  }
}