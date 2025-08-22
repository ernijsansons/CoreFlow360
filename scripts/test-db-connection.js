#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the connection to your Supabase database
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Parse and display connection info (hiding password)
  const urlParts = databaseUrl.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/(.+)/);
  if (urlParts) {
    console.log('📊 Connection Details:');
    console.log(`   User: ${urlParts[1]}`);
    console.log(`   Host: ${urlParts[3]}`);
    console.log(`   Port: ${urlParts[4]}`);
    console.log(`   Database: ${urlParts[5].split('?')[0]}`);
    console.log(`   SSL: ${databaseUrl.includes('sslmode=require') ? 'Required' : 'Not specified'}`);
    console.log(`   Pooler: ${urlParts[3].includes('pooler.supabase.com') ? 'Yes' : 'No'}\n`);
  }
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    console.log('🔌 Attempting to connect...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic connection successful!\n');
    
    // Test database info
    const dbInfo = await prisma.$queryRaw`
      SELECT current_database() as database,
             current_user as user,
             version() as version
    `;
    console.log('📋 Database Info:');
    console.log(`   Database: ${dbInfo[0].database}`);
    console.log(`   User: ${dbInfo[0].user}`);
    console.log(`   Version: ${dbInfo[0].version.split(',')[0]}\n`);
    
    // Test table access
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      LIMIT 5
    `;
    console.log(`📁 Found ${tables.length} tables in public schema`);
    if (tables.length > 0) {
      console.log('   Tables:', tables.map(t => t.tablename).join(', '));
    }
    
    console.log('\n✅ All database tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Suggestions:');
      console.log('1. Use the Supabase pooler connection string instead of direct connection');
      console.log('2. Check if your Supabase project is active (not paused)');
      console.log('3. Verify the connection string format in Vercel environment variables');
      console.log('4. Try using Session Mode (port 5432) or Transaction Mode (port 6543)');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);