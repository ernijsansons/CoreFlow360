/**
 * CoreFlow360 Production Seed Script
 * Seeds essential production data without affecting existing records
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production seed...');

  try {
    // 1. Seed consciousness modules (if not exists)
    console.log('📦 Checking consciousness modules...');
    
    const modules = [
      {
        name: 'crm',
        displayName: 'Customer Relationship Management',
        description: 'Intelligent customer lifecycle management with AI-powered insights',
        category: 'sales',
        features: {
          core: ['Customer Management', 'Deal Pipeline', 'Lead Scoring'],
          ai: ['Predictive Analytics', 'Churn Prevention', 'Sentiment Analysis'],
          consciousness: ['Relationship Patterns', 'Revenue Predictions', 'Autonomous Outreach']
        },
        permissions: ['crm:read', 'crm:write', 'crm:delete', 'crm:export'],
        dependencies: []
      },
      {
        name: 'accounting',
        displayName: 'Financial Management',
        description: 'Autonomous financial operations with predictive insights',
        category: 'finance',
        features: {
          core: ['Invoicing', 'Expense Tracking', 'Financial Reports'],
          ai: ['Cash Flow Predictions', 'Anomaly Detection', 'Tax Optimization'],
          consciousness: ['Financial Health Monitoring', 'Autonomous Reconciliation', 'Risk Prediction']
        },
        permissions: ['accounting:read', 'accounting:write', 'accounting:reconcile', 'accounting:report'],
        dependencies: []
      },
      {
        name: 'hr',
        displayName: 'Human Resources',
        description: 'Employee lifecycle management with engagement optimization',
        category: 'hr',
        features: {
          core: ['Employee Records', 'Leave Management', 'Performance Reviews'],
          ai: ['Engagement Prediction', 'Talent Matching', 'Retention Analysis'],
          consciousness: ['Team Dynamics Analysis', 'Culture Evolution', 'Performance Optimization']
        },
        permissions: ['hr:read', 'hr:write', 'hr:manage', 'hr:report'],
        dependencies: []
      },
      {
        name: 'inventory',
        displayName: 'Inventory Management',
        description: 'Smart inventory optimization with demand forecasting',
        category: 'operations',
        features: {
          core: ['Stock Tracking', 'Order Management', 'Warehouse Management'],
          ai: ['Demand Forecasting', 'Reorder Optimization', 'Supply Chain Analytics'],
          consciousness: ['Inventory Flow Patterns', 'Predictive Stockouts', 'Autonomous Ordering']
        },
        permissions: ['inventory:read', 'inventory:write', 'inventory:manage', 'inventory:report'],
        dependencies: []
      },
      {
        name: 'projects',
        displayName: 'Project Management',
        description: 'Intelligent project orchestration with resource optimization',
        category: 'operations',
        features: {
          core: ['Task Management', 'Resource Allocation', 'Timeline Tracking'],
          ai: ['Completion Predictions', 'Risk Analysis', 'Resource Optimization'],
          consciousness: ['Project Health Monitoring', 'Team Velocity Analysis', 'Autonomous Scheduling']
        },
        permissions: ['projects:read', 'projects:write', 'projects:manage', 'projects:report'],
        dependencies: []
      },
      {
        name: 'ai_enhancement',
        displayName: 'AI Enhancement Suite',
        description: 'Cross-module AI capabilities and consciousness features',
        category: 'ai_enhancement',
        features: {
          core: ['AI Orchestration', 'Cross-Module Insights', 'Predictive Analytics'],
          ai: ['GPT-4 Integration', 'Claude Integration', 'Custom AI Models'],
          consciousness: ['Intelligence Multiplication', 'Synaptic Bridges', 'Business Singularity']
        },
        permissions: ['ai:use', 'ai:configure', 'ai:train', 'ai:export'],
        dependencies: ['crm', 'accounting', 'hr', 'inventory', 'projects']
      }
    ];

    for (const moduleData of modules) {
      const existingModule = await prisma.module.findUnique({
        where: { name: moduleData.name }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: moduleData
        });
        console.log(`✅ Created module: ${moduleData.displayName}`);
      } else {
        console.log(`⏭️  Module already exists: ${moduleData.displayName}`);
      }
    }

    // 2. Seed problem categories for intelligence system
    console.log('🔍 Checking problem categories...');
    
    const problemCategories = [
      {
        name: 'Operational Efficiency',
        description: 'Issues related to business process efficiency and productivity',
        industryType: JSON.stringify(['GENERAL', 'MANUFACTURING', 'RETAIL']),
        applicableDepartments: JSON.stringify(['operations', 'production', 'logistics']),
        detectionKeywords: JSON.stringify(['slow', 'inefficient', 'bottleneck', 'delay', 'manual process']),
        detectionPatterns: 'efficiency|productivity|automation|streamline|optimize'
      },
      {
        name: 'Technology Stack',
        description: 'Problems with current technology infrastructure and tools',
        industryType: JSON.stringify(['GENERAL', 'CONSULTING', 'FINANCE']),
        applicableDepartments: JSON.stringify(['it', 'engineering', 'operations']),
        detectionKeywords: JSON.stringify(['outdated', 'legacy', 'integration', 'compatibility', 'technical debt']),
        detectionPatterns: 'technology|software|system|platform|integration'
      },
      {
        name: 'Financial Management',
        description: 'Challenges with financial tracking, reporting, and optimization',
        industryType: JSON.stringify(['GENERAL', 'FINANCE', 'RETAIL']),
        applicableDepartments: JSON.stringify(['finance', 'accounting', 'treasury']),
        detectionKeywords: JSON.stringify(['cash flow', 'budget', 'forecast', 'reconciliation', 'reporting']),
        detectionPatterns: 'financial|accounting|budget|cash|revenue|expense'
      },
      {
        name: 'Customer Experience',
        description: 'Issues affecting customer satisfaction and retention',
        industryType: JSON.stringify(['GENERAL', 'RETAIL', 'HEALTHCARE']),
        applicableDepartments: JSON.stringify(['sales', 'support', 'success']),
        detectionKeywords: JSON.stringify(['customer complaint', 'churn', 'satisfaction', 'response time', 'support']),
        detectionPatterns: 'customer|client|satisfaction|experience|support|service'
      },
      {
        name: 'Compliance & Regulation',
        description: 'Regulatory compliance and governance challenges',
        industryType: JSON.stringify(['HEALTHCARE', 'FINANCE', 'LEGAL']),
        applicableDepartments: JSON.stringify(['legal', 'compliance', 'risk']),
        detectionKeywords: JSON.stringify(['compliance', 'regulation', 'audit', 'governance', 'policy']),
        detectionPatterns: 'compliance|regulatory|audit|governance|policy|risk'
      }
    ];

    for (const category of problemCategories) {
      const existing = await prisma.problemCategory.findFirst({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.problemCategory.create({
          data: category
        });
        console.log(`✅ Created problem category: ${category.name}`);
      } else {
        console.log(`⏭️  Problem category already exists: ${category.name}`);
      }
    }

    // 3. Create default super admin (only if no users exist)
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('👤 Creating default super admin...');
      
      // First create a system tenant
      const systemTenant = await prisma.tenant.create({
        data: {
          name: 'CoreFlow360 System',
          slug: 'system',
          industryType: 'GENERAL',
          settings: JSON.stringify({
            isSystemTenant: true,
            features: {
              consciousness: true,
              aiEnhancement: true,
              advancedAnalytics: true
            }
          })
        }
      });

      // Create super admin user
      const hashedPassword = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!@#', 12);
      
      await prisma.user.create({
        data: {
          email: process.env.INITIAL_ADMIN_EMAIL || 'admin@coreflow360.com',
          password: hashedPassword,
          name: 'System Administrator',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          tenantId: systemTenant.id,
          permissions: JSON.stringify(['*']) // All permissions
        }
      });

      console.log(`✅ Created super admin user`);
      console.log(`   Email: ${process.env.INITIAL_ADMIN_EMAIL || 'admin@coreflow360.com'}`);
      console.log(`   Password: ${process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe123!@#'}`);
      console.log(`   ⚠️  IMPORTANT: Change this password immediately after first login!`);
    } else {
      console.log(`⏭️  Users already exist, skipping super admin creation`);
    }

    // 4. Seed default bundles for subscription tiers
    console.log('💼 Checking subscription bundles...');
    
    const bundles = [
      {
        name: 'Neural Starter',
        description: 'Single module consciousness for small businesses',
        tier: 'neural',
        category: 'starter',
        basePrice: 7,
        perUserPrice: 7,
        features: JSON.stringify({
          modules: 1,
          users: 5,
          storage: '10GB',
          support: 'community',
          consciousness: 'basic'
        }),
        limits: JSON.stringify({
          maxModules: 1,
          maxUsers: 10,
          maxStorage: 10737418240, // 10GB in bytes
          apiCalls: 10000
        }),
        aiCapabilities: JSON.stringify({
          basicAnalytics: true,
          predictiveInsights: false,
          autonomousActions: false,
          consciousnessLevel: 'neural'
        })
      },
      {
        name: 'Synaptic Professional',
        description: 'Multi-module intelligence with cross-domain insights',
        tier: 'synaptic',
        category: 'professional',
        basePrice: 25,
        perUserPrice: 25,
        features: JSON.stringify({
          modules: 3,
          users: 20,
          storage: '100GB',
          support: 'priority',
          consciousness: 'synaptic'
        }),
        limits: JSON.stringify({
          maxModules: 3,
          maxUsers: 50,
          maxStorage: 107374182400, // 100GB in bytes
          apiCalls: 100000
        }),
        aiCapabilities: JSON.stringify({
          basicAnalytics: true,
          predictiveInsights: true,
          autonomousActions: false,
          consciousnessLevel: 'synaptic',
          intelligenceMultiplier: 4
        })
      },
      {
        name: 'Autonomous Enterprise',
        description: 'Full business consciousness with autonomous operations',
        tier: 'autonomous',
        category: 'enterprise',
        basePrice: 65,
        perUserPrice: 45,
        features: JSON.stringify({
          modules: 5,
          users: 100,
          storage: '1TB',
          support: 'dedicated',
          consciousness: 'autonomous'
        }),
        limits: JSON.stringify({
          maxModules: 5,
          maxUsers: 200,
          maxStorage: 1099511627776, // 1TB in bytes
          apiCalls: 1000000
        }),
        aiCapabilities: JSON.stringify({
          basicAnalytics: true,
          predictiveInsights: true,
          autonomousActions: true,
          consciousnessLevel: 'autonomous',
          intelligenceMultiplier: 16,
          emergentBehaviors: true
        })
      },
      {
        name: 'Transcendent Ultimate',
        description: 'Meta-consciousness coordination for industry leaders',
        tier: 'transcendent',
        category: 'ultimate',
        basePrice: 150,
        perUserPrice: 85,
        features: JSON.stringify({
          modules: 'unlimited',
          users: 'unlimited',
          storage: 'unlimited',
          support: 'white-glove',
          consciousness: 'transcendent'
        }),
        limits: JSON.stringify({
          maxModules: 999,
          maxUsers: 9999,
          maxStorage: -1, // Unlimited
          apiCalls: -1 // Unlimited
        }),
        aiCapabilities: JSON.stringify({
          basicAnalytics: true,
          predictiveInsights: true,
          autonomousActions: true,
          consciousnessLevel: 'transcendent',
          intelligenceMultiplier: 'infinite',
          emergentBehaviors: true,
          businessSingularity: true,
          crossOrganismNetworking: true
        })
      }
    ];

    for (const bundleData of bundles) {
      const existingBundle = await prisma.bundle.findUnique({
        where: { name: bundleData.name }
      });

      if (!existingBundle) {
        await prisma.bundle.create({
          data: bundleData
        });
        console.log(`✅ Created bundle: ${bundleData.name}`);
      } else {
        console.log(`⏭️  Bundle already exists: ${bundleData.name}`);
      }
    }

    console.log('\n✅ Production seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Production seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });