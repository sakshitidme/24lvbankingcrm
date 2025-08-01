import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.user.deleteMany()
  await prisma.bank.deleteMany()

  // Create test bank
  const testBank = await prisma.bank.create({
    data: {
      id: 'test-bank-123',
      name: 'Test Bank',
    },
  })

  // Create SBI bank
  const sbiBank = await prisma.bank.create({
    data: {
      id: 'sbi-bank-123',
      name: 'State Bank of India',
    },
  })

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-123',
      email: 'admin@24lv.com',
      firstName: 'Admin',
      lastName: 'User',
      permissions: ['admin'],
      bankId: testBank.id,
      walletBalance: 25000,
      isActive: true,
      password: hashedPassword,
    },
  })

  // Create bank user
  const bankUser = await prisma.user.create({
    data: {
      id: 'bank-user-123',
      email: 'bank@sbi.com',
      firstName: 'Bank',
      lastName: 'User',
      permissions: ['bank_user'],
      bankId: sbiBank.id,
      walletBalance: 10000,
      isActive: true,
      password: hashedPassword,
    },
  })

  // Create valuator user
  const valuatorUser = await prisma.user.create({
    data: {
      id: 'valuator-user-123',
      email: 'valuator@24lv.com',
      firstName: 'Valuator',
      lastName: 'User',
      permissions: ['valuator'],
      bankId: testBank.id,
      walletBalance: 5000,
      isActive: true,
      password: hashedPassword,
    },
  })

  // Create advocate user
  const advocateUser = await prisma.user.create({
    data: {
      id: 'advocate-user-123',
      email: 'advocate@24lv.com',
      firstName: 'Advocate',
      lastName: 'User',
      permissions: ['advocate'],
      bankId: testBank.id,
      walletBalance: 7500,
      isActive: true,
      password: hashedPassword,
    },
  })

  console.log('Seed data created:', { 
    testBank, 
    sbiBank, 
    adminUser, 
    bankUser, 
    valuatorUser, 
    advocateUser 
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })