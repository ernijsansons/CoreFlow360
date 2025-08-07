const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAdmin() {
  console.log('🔧 Setting up super admin account...')

  try {
    // Create super admin tenant
    const adminTenant = await prisma.tenant.upsert({
      where: { slug: 'super-admin' },
      update: {},
      create: {
        id: 'super-admin-tenant',
        name: 'Super Admin',
        slug: 'super-admin',
        industryType: 'admin',
        isActive: true,
      },
    })

    // Hash the password
    const hashedPassword = await bcrypt.hash('Ernijs121291!', 12)

    // Create super admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'ernijs.ansons@gmail.com' },
      update: {
        password: hashedPassword,
        name: 'Ernijs Ansons',
        tenantId: adminTenant.id,
        isActive: true,
      },
      create: {
        email: 'ernijs.ansons@gmail.com',
        name: 'Ernijs Ansons',
        password: hashedPassword,
        tenantId: adminTenant.id,
        isActive: true,
      },
    })

    console.log('✅ Super admin account created successfully!')
    console.log('📧 Email: ernijs.ansons@gmail.com')
    console.log('🔑 Password: Ernijs121291!')
    console.log('🌐 Login at: https://coreflow360.vercel.app/auth/signin')
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupAdmin()