/**
 * CoreFlow360 - Module Definitions Seeder
 * Seeds database with Odoo-competitive modular pricing structure
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedModules() {
  console.log('🌱 Seeding module definitions...')

  // Define all available modules with pricing
  const moduleDefinitions = [
    {
      moduleKey: 'crm',
      name: 'Customer Relationship Management',
      description: 'Lead management, customer tracking, sales pipeline with AI insights',
      category: 'core',
      basePrice: 7.0,
      perUserPrice: 7.0,
      setupFee: null,
      dependencies: '[]',
      conflicts: '[]',
      defaultEnabled: true,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        leadScoring: true,
        churnPrediction: true,
        salesForecasting: true,
        sentimentAnalysis: true,
        nextBestAction: true
      }),
      crossModuleEvents: JSON.stringify([
        'lead.created',
        'deal.won',
        'customer.updated',
        'interaction.logged'
      ]),
      featureFlags: JSON.stringify({
        leadImport: true,
        emailIntegration: true,
        taskAutomation: true,
        reportingDashboard: true
      })
    },
    {
      moduleKey: 'accounting',
      name: 'Financial Management',
      description: 'Invoicing, expense tracking, financial reporting with AI reconciliation',
      category: 'core',
      basePrice: 12.0,
      perUserPrice: 12.0,
      setupFee: 25.0,
      dependencies: '[]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        billDiscrepancyDetection: true,
        cashFlowPrediction: true,
        fraudDetection: true,
        expenseOptimization: true,
        automaticReconciliation: true
      }),
      crossModuleEvents: JSON.stringify([
        'invoice.created',
        'payment.received',
        'expense.recorded',
        'budget.exceeded'
      ]),
      featureFlags: JSON.stringify({
        invoiceAutomation: true,
        expenseApprovals: true,
        taxCalculation: true,
        financialReporting: true
      })
    },
    {
      moduleKey: 'hr',
      name: 'Human Resources',
      description: 'Employee management, performance tracking, recruitment with AI analysis',
      category: 'core', 
      basePrice: 10.0,
      perUserPrice: 10.0,
      setupFee: 15.0,
      dependencies: '[]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 2,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        resumeScreening: true,
        performancePrediction: true,
        attritionRisk: true,
        skillGapAnalysis: true,
        compensationOptimization: true
      }),
      crossModuleEvents: JSON.stringify([
        'employee.hired',
        'performance.reviewed',
        'leave.requested',
        'training.completed'
      ]),
      featureFlags: JSON.stringify({
        recruitmentPipeline: true,
        performanceReviews: true,
        leaveManagement: true,
        payrollIntegration: true
      })
    },
    {
      moduleKey: 'inventory',
      name: 'Inventory Management',
      description: 'Stock tracking, demand forecasting, procurement with AI optimization',
      category: 'advanced',
      basePrice: 8.0,
      perUserPrice: 8.0,
      setupFee: 20.0,
      dependencies: '[]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        demandForecasting: true,
        stockOptimization: true,
        supplierAnalysis: true,
        wastageReduction: true,
        automaticReordering: true
      }),
      crossModuleEvents: JSON.stringify([
        'stock.low',
        'purchase.requested',
        'item.received',
        'inventory.counted'
      ]),
      featureFlags: JSON.stringify({
        barcodeScanning: true,
        supplierPortal: true,
        warehouseManagement: true,
        costTracking: true
      })
    },
    {
      moduleKey: 'projects',
      name: 'Project Management',
      description: 'Task management, resource allocation, timeline tracking with AI insights',
      category: 'advanced',
      basePrice: 9.0,
      perUserPrice: 9.0,
      setupFee: 10.0,
      dependencies: '[]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 2,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        projectRiskAnalysis: true,
        resourceOptimization: true,
        deadlinePrediction: true,
        workloadBalancing: true,
        budgetForecasting: true
      }),
      crossModuleEvents: JSON.stringify([
        'project.created',
        'task.completed',
        'milestone.reached',
        'budget.updated'
      ]),
      featureFlags: JSON.stringify({
        ganttCharts: true,
        timeTracking: true,
        resourceCalendar: true,
        clientPortal: true
      })
    },
    {
      moduleKey: 'marketing',
      name: 'Marketing Automation',
      description: 'Campaign management, lead nurturing, analytics with AI personalization',
      category: 'advanced',
      basePrice: 15.0,
      perUserPrice: 15.0,
      setupFee: 35.0,
      dependencies: '["crm"]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        campaignOptimization: true,
        audienceSegmentation: true,
        contentPersonalization: true,
        leadNurturing: true,
        roiPrediction: true
      }),
      crossModuleEvents: JSON.stringify([
        'campaign.launched',
        'lead.nurtured',
        'email.opened',
        'conversion.tracked'
      ]),
      featureFlags: JSON.stringify({
        emailCampaigns: true,
        socialMediaIntegration: true,
        landingPages: true,
        analyticsReporting: true
      })
    },
    {
      moduleKey: 'hvac_industry',
      name: 'HVAC Industry Specialization',
      description: 'Equipment tracking, service schedules, energy efficiency with HVAC-specific AI',
      category: 'industry',
      basePrice: 15.0,
      perUserPrice: 15.0,
      setupFee: 50.0,
      dependencies: '["crm", "projects"]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        equipmentFailurePrediction: true,
        routeOptimization: true,
        energyEfficiencyAnalysis: true,
        maintenanceScheduling: true,
        warrantyTracking: true
      }),
      crossModuleEvents: JSON.stringify([
        'equipment.serviced',
        'maintenance.scheduled',
        'warranty.expiring',
        'emergency.dispatched'
      ]),
      featureFlags: JSON.stringify({
        equipmentDatabase: true,
        serviceHistory: true,
        permitTracking: true,
        technicianGPS: true
      })
    },
    {
      moduleKey: 'legal_industry',
      name: 'Legal Practice Management',
      description: 'Case management, document tracking, billing with legal-specific AI',
      category: 'industry',
      basePrice: 20.0,
      perUserPrice: 20.0,
      setupFee: 75.0,
      dependencies: '["crm", "accounting"]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 1,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        caseAnalysis: true,
        documentReview: true,
        billingOptimization: true,
        conflictChecking: true,
        legalResearch: true
      }),
      crossModuleEvents: JSON.stringify([
        'case.opened',
        'document.filed',
        'court.scheduled',
        'billing.generated'
      ]),
      featureFlags: JSON.stringify({
        caseManagement: true,
        documentManagement: true,
        courtCalendar: true,
        trustAccounting: true
      })
    },
    {
      moduleKey: 'healthcare_industry',
      name: 'Healthcare Practice Management',
      description: 'Patient management, appointment scheduling, compliance with healthcare AI',
      category: 'industry',
      basePrice: 25.0,
      perUserPrice: 25.0,
      setupFee: 100.0,
      dependencies: '["crm", "hr"]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: false,
      minUserCount: 2,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        patientRiskAssessment: true,
        appointmentOptimization: true,
        treatmentRecommendations: true,
        complianceMonitoring: true,
        resourcePlanning: true
      }),
      crossModuleEvents: JSON.stringify([
        'patient.registered',
        'appointment.scheduled',
        'treatment.completed',
        'insurance.claimed'
      ]),
      featureFlags: JSON.stringify({
        patientPortal: true,
        appointmentBooking: true,
        medicalRecords: true,
        insuranceBilling: true,
        hipaaCompliance: true
      })
    },
    {
      moduleKey: 'analytics_enterprise',
      name: 'Enterprise Analytics Suite',
      description: 'Advanced business intelligence, predictive analytics, executive dashboards',
      category: 'advanced',
      basePrice: 35.0,
      perUserPrice: 35.0,
      setupFee: 150.0,
      dependencies: '["crm", "accounting"]',
      conflicts: '[]',
      defaultEnabled: false,
      enterpriseOnly: true,
      minUserCount: 5,
      maxUserCount: null,
      aiCapabilities: JSON.stringify({
        businessIntelligence: true,
        predictiveModeling: true,
        customReporting: true,
        dataVisualization: true,
        executiveDashboards: true
      }),
      crossModuleEvents: JSON.stringify([
        'report.generated',
        'insight.discovered',
        'anomaly.detected',
        'forecast.updated'
      ]),
      featureFlags: JSON.stringify({
        customDashboards: true,
        dataExport: true,
        scheduledReports: true,
        apiAccess: true,
        whiteLabeling: true
      })
    }
  ]

  // Seed module definitions
  for (const moduleData of moduleDefinitions) {
    await prisma.moduleDefinition.upsert({
      where: { moduleKey: moduleData.moduleKey },
      update: moduleData,
      create: moduleData
    })
    
    console.log(`✅ Seeded module: ${moduleData.name} ($${moduleData.perUserPrice}/user/month)`)
  }

  console.log('🌱 Seeding bundle definitions...')

  // Define subscription bundles
  const bundleDefinitions = [
    {
      bundleKey: 'starter',
      name: 'Starter Bundle',
      description: 'Perfect for small businesses getting started with CRM and basic accounting',
      includedModules: JSON.stringify(['crm', 'accounting']),
      discountRate: 0.20, // 20% discount
      minUsers: 1,
      maxUsers: 10,
      basePrice: 15.0, // $19 normally, discounted to $15
      perUserPrice: 15.0,
      isActive: true,
      isPopular: true,
      recommendedFor: JSON.stringify({
        userCount: { min: 1, max: 10 },
        industries: ['general', 'consulting', 'services'],
        features: ['basic_crm', 'simple_invoicing']
      })
    },
    {
      bundleKey: 'growth',
      name: 'Growth Bundle',
      description: 'Comprehensive solution for growing businesses with CRM, accounting, HR, and projects',
      includedModules: JSON.stringify(['crm', 'accounting', 'hr', 'projects']),
      discountRate: 0.25, // 25% discount
      minUsers: 3,
      maxUsers: 50,
      basePrice: 29.0, // $38 normally, discounted to $29
      perUserPrice: 29.0,
      isActive: true,
      isPopular: true,
      recommendedFor: JSON.stringify({
        userCount: { min: 3, max: 50 },
        industries: ['general', 'consulting', 'construction', 'hvac'],
        features: ['team_management', 'project_tracking', 'hr_basics']
      })
    },
    {
      bundleKey: 'enterprise',
      name: 'Enterprise Suite',
      description: 'Full-featured platform with all modules, advanced AI, and premium support',
      includedModules: JSON.stringify(['crm', 'accounting', 'hr', 'projects', 'inventory', 'marketing', 'analytics_enterprise']),
      discountRate: 0.30, // 30% discount
      minUsers: 10,
      maxUsers: null, // unlimited
      basePrice: 58.0, // $83 normally, discounted to $58
      perUserPrice: 58.0,
      isActive: true,
      isPopular: false,
      recommendedFor: JSON.stringify({
        userCount: { min: 10, max: null },
        industries: ['all'],
        features: ['full_suite', 'advanced_ai', 'custom_integrations']
      })
    },
    {
      bundleKey: 'hvac_professional',
      name: 'HVAC Professional',
      description: 'Complete HVAC business solution with industry-specific features',
      includedModules: JSON.stringify(['crm', 'projects', 'inventory', 'hvac_industry']),
      discountRate: 0.22, // 22% discount
      minUsers: 2,
      maxUsers: 25,
      basePrice: 38.0, // $49 normally, discounted to $38
      perUserPrice: 38.0,
      isActive: true,
      isPopular: true,
      recommendedFor: JSON.stringify({
        userCount: { min: 2, max: 25 },
        industries: ['hvac'],
        features: ['service_management', 'equipment_tracking', 'route_optimization']
      })
    },
    {
      bundleKey: 'legal_practice',
      name: 'Legal Practice Bundle',
      description: 'Comprehensive legal practice management with case and billing features',
      includedModules: JSON.stringify(['crm', 'accounting', 'legal_industry']),
      discountRate: 0.18, // 18% discount
      minUsers: 1,
      maxUsers: 20,
      basePrice: 48.0, // $59 normally, discounted to $48
      perUserPrice: 48.0,
      isActive: true,
      isPopular: false,
      recommendedFor: JSON.stringify({
        userCount: { min: 1, max: 20 },
        industries: ['legal'],
        features: ['case_management', 'trust_accounting', 'document_management']
      })
    }
  ]

  // Seed bundle definitions
  for (const bundleData of bundleDefinitions) {
    await prisma.bundleDefinition.upsert({
      where: { bundleKey: bundleData.bundleKey },
      update: bundleData,
      create: bundleData
    })
    
    console.log(`✅ Seeded bundle: ${bundleData.name} ($${bundleData.perUserPrice}/user/month)`)
  }

  console.log('🎉 Module and bundle seeding completed!')
}

async function main() {
  try {
    await seedModules()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()