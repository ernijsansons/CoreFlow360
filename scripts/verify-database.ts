import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying database connection and structure...\n');
  
  try {
    // Test database connectivity
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Get all table names from SQLite
    const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_%'
      ORDER BY name;
    `;
    
    console.log(`📊 Found ${tables.length} tables in the database:\n`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
    
    // Define required models
    const requiredModels = [
      'tenants', // Mapped from Tenant
      'users', // Mapped from User
      'departments', // Mapped from Department
      'customers', // Mapped from Customer
      'deals', // Mapped from Deal
      'projects', // Mapped from Project
      'invoices', // Mapped from Invoice
      'time_entries', // Mapped from TimeEntry
      'communications', // Mapped from Communication
      'ai_insights', // Mapped from AIInsight
      'ai_activities', // Mapped from AIActivity
      'ai_conversations', // Mapped from AIConversation
      'industry_ai_agents', // Mapped from IndustryAIAgent
      'industry_custom_fields', // Mapped from IndustryCustomField
      'industry_customer_intelligence', // Mapped from IndustryCustomerIntelligence
      'industry_compliance', // Mapped from IndustryCompliance
      'audit_logs', // Mapped from AuditLog
      'system_health' // Mapped from SystemHealth
    ];
    
    console.log('\n🔍 Checking required models:\n');
    
    const tableNames = tables.map(t => t.name);
    const missingTables: string[] = [];
    
    requiredModels.forEach(model => {
      if (tableNames.includes(model)) {
        console.log(`✅ ${model}`);
      } else {
        console.log(`❌ ${model} (MISSING)`);
        missingTables.push(model);
      }
    });
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing ${missingTables.length} tables. You may need to run migrations.`);
      console.log('Run: npx prisma migrate dev');
    } else {
      console.log('\n✅ All required models exist in the database!');
    }
    
    // Test a simple query
    console.log('\n🧪 Testing basic query functionality...');
    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    
    console.log(`- Tenants: ${tenantCount}`);
    console.log(`- Users: ${userCount}`);
    
    console.log('\n✅ Database structure verification complete!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    console.log('\nPossible solutions:');
    console.log('1. Check if DATABASE_URL is set correctly in .env');
    console.log('2. Run: npx prisma generate');
    console.log('3. Run: npx prisma migrate dev');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyDatabaseConnection().catch(console.error);