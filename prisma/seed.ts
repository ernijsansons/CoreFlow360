import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

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

  console.log('✅ Created admin tenant:', adminTenant.name)

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

  console.log('✅ Created super admin user:', adminUser.email)
  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })