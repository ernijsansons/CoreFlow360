# CoreFlow360 Code Audit Report

**Generated:** 8/17/2025, 12:02:05 PM

## 📊 Executive Summary

- **Total Issues:** 6284
- **Critical Issues:** 0 🔴
- **High Issues:** 36 🟠
- **Medium Issues:** 361 🟡
- **Low Issues:** 5887 🟢

## Security Issues

**Total:** 397

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/auth/session-security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/auth/session-security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

- **CSRF Vulnerabilities**: No description
  - File: `src/__tests__/security.test.ts`
  - Severity: medium

*... and 387 more issues*

## Quality Issues

**Total:** 4939

- **typescript**: .next/types/app/api/admin/api-keys/[id]/rotate/route.ts(49,7): error TS2344: Type '{ __tag__: "GET"; __param_position__: "second"; __param_type__: RouteParams; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/admin/api-keys/[id]/rotate/route.ts(166,7): error TS2344: Type '{ __tag__: "POST"; __param_position__: "second"; __param_type__: RouteParams; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/admin/api-keys/[id]/route.ts(49,7): error TS2344: Type '{ __tag__: "GET"; __param_position__: "second"; __param_type__: RouteParams; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/admin/api-keys/[id]/route.ts(205,7): error TS2344: Type '{ __tag__: "PUT"; __param_position__: "second"; __param_type__: RouteParams; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/admin/api-keys/[id]/route.ts(244,7): error TS2344: Type '{ __tag__: "DELETE"; __param_position__: "second"; __param_type__: RouteParams; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/ai/intelligence/route.ts(12,13): error TS2344: Type 'OmitWithTag<typeof import("C:/Users/ernij/OneDrive/Documents/Cursor/coreflow360/src/app/api/ai/intelligence/route"), "config" | "generateStaticParams" | "revalidate" | "dynamic" | "dynamicParams" | ... 10 more ... | "PATCH", "">' does not satisfy the constraint '{ [x: string]: never; }'.

- **typescript**: .next/types/app/api/auth/saml/metadata/[tenantId]/[idpName]/route.ts(49,7): error TS2344: Type '{ __tag__: "GET"; __param_position__: "second"; __param_type__: { params: { tenantId: string; idpName: string; }; }; }' does not satisfy the constraint 'ParamCheck<RouteContext>'.

- **typescript**: .next/types/app/api/billing/anomalies/route.ts(12,13): error TS2344: Type 'OmitWithTag<typeof import("C:/Users/ernij/OneDrive/Documents/Cursor/coreflow360/src/app/api/billing/anomalies/route"), "config" | "generateStaticParams" | "revalidate" | "dynamic" | ... 11 more ... | "PATCH", "">' does not satisfy the constraint '{ [x: string]: never; }'.

- **typescript**: .next/types/app/api/events/batch/route.ts(12,13): error TS2344: Type 'OmitWithTag<typeof import("C:/Users/ernij/OneDrive/Documents/Cursor/coreflow360/src/app/api/events/batch/route"), "config" | "generateStaticParams" | "revalidate" | "dynamic" | "dynamicParams" | ... 10 more ... | "PATCH", "">' does not satisfy the constraint '{ [x: string]: never; }'.

- **typescript**: .next/types/app/api/intelligence/business/route.ts(12,13): error TS2344: Type 'OmitWithTag<typeof import("C:/Users/ernij/OneDrive/Documents/Cursor/coreflow360/src/app/api/intelligence/business/route"), "config" | "generateStaticParams" | "revalidate" | "dynamic" | ... 11 more ... | "PATCH", "">' does not satisfy the constraint '{ [x: string]: never; }'.

*... and 4929 more issues*

## Compliance Issues

**Total:** 913

- **Accessibility**: ARIA attributes
  - File: `src/__tests__/accessibility/wcag-aaa.test.tsx`

- **Accessibility**: Keyboard navigation
  - File: `src/__tests__/accessibility/wcag-aaa.test.tsx`

- **Accessibility**: Keyboard navigation
  - File: `src/__tests__/audit/sacred-audit.test.ts`

- **Error Handling**: Error throwing
  - File: `src/__tests__/auth/session-security.test.ts`

- **Accessibility**: ARIA attributes
  - File: `src/__tests__/components/SubscriptionDashboard.test.tsx`

- **Accessibility**: Keyboard navigation
  - File: `src/__tests__/components/SubscriptionDashboard.test.tsx`

- **Error Handling**: Error throwing
  - File: `src/__tests__/consciousness/autonomous-decision-engine.test.ts`

- **Error Handling**: Error handling patterns
  - File: `src/__tests__/consciousness/consciousness-emergence.test.ts`

- **Error Handling**: Error throwing
  - File: `src/__tests__/database/tenant-isolation.test.ts`

- **Accessibility**: ARIA attributes
  - File: `src/__tests__/e2e/ai-orchestration.spec.ts`

*... and 903 more issues*

## Secrets Issues

**Total:** 35

- **hardcoded_secret**: No description
  - File: `src/__tests__/api/api-routes.integration.test.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/api/api-routes.integration.test.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/auth/session-security.test.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/ai-orchestration.spec.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/auth-flow.spec.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/global-setup.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/global-setup.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/global-setup.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/e2e/global-setup.ts`

- **hardcoded_secret**: No description
  - File: `src/__tests__/integration/api-flow.test.ts`

*... and 25 more issues*

## 🚀 Recommendations

🟠 **High Priority:** Address high-severity issues within the next sprint.

🟡 **Medium Priority:** Plan to address medium-severity issues in upcoming releases.

## 📋 Next Steps

1. Review the detailed JSON report for specific issue locations
2. Prioritize fixes based on severity and business impact
3. Run this audit again after implementing fixes
4. Consider integrating this audit into your CI/CD pipeline

