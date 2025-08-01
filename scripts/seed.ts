import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create banks
  const existingBank1 = await prisma.bank.findFirst({
    where: { name: 'State Bank of India' }
  })
  const bank1 = existingBank1 || await prisma.bank.create({
    data: {
      name: 'State Bank of India',
    },
  })

  const existingBank2 = await prisma.bank.findFirst({
    where: { name: 'HDFC Bank' }
  })
  const bank2 = existingBank2 || await prisma.bank.create({
    data: {
      name: 'HDFC Bank',
    },
  })

  console.log('✅ Banks created')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@24lv.com' },
    update: {},
    create: {
      email: 'admin@24lv.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      permissions: ['admin'],
      isActive: true,
      walletBalance: 0,
    },
  })

  // Create valuator user
  const valuatorUser = await prisma.user.upsert({
    where: { email: 'valuator@24lv.com' },
    update: {},
    create: {
      email: 'valuator@24lv.com',
      firstName: 'John',
      lastName: 'Valuator',
      password: hashedPassword,
      permissions: ['valuator'],
      isActive: true,
      walletBalance: 5000,
    },
  })

  // Create advocate user
  const advocateUser = await prisma.user.upsert({
    where: { email: 'advocate@24lv.com' },
    update: {},
    create: {
      email: 'advocate@24lv.com',
      firstName: 'Jane',
      lastName: 'Advocate',
      password: hashedPassword,
      permissions: ['advocate'],
      isActive: true,
      walletBalance: 3000,
    },
  })

  // Create bank user
  const bankUser = await prisma.user.upsert({
    where: { email: 'bank@sbi.com' },
    update: {},
    create: {
      email: 'bank@sbi.com',
      firstName: 'Bank',
      lastName: 'Manager',
      password: hashedPassword,
      permissions: ['bank'],
      isActive: true,
      walletBalance: 0,
      bankId: bank1.id,
    },
  })

  console.log('✅ Users created')

  // Create sample forms
  const existingValuationForm = await prisma.form.findFirst({
    where: { formName: 'Property Valuation Form' }
  })
  const valuationForm = existingValuationForm || await prisma.form.create({
    data: {
      formName: 'Property Valuation Form',
      fields: [
        {
          id: 'property_address',
          label: 'Property Address',
          type: 'textarea',
          required: true,
          placeholder: 'Enter complete property address'
        },
        {
          id: 'property_type',
          label: 'Property Type',
          type: 'select',
          required: true,
          options: ['Residential', 'Commercial', 'Industrial', 'Agricultural']
        },
        {
          id: 'area_sqft',
          label: 'Area (Sq. Ft.)',
          type: 'number',
          required: true,
          placeholder: 'Enter area in square feet'
        },
        {
          id: 'loan_amount',
          label: 'Loan Amount',
          type: 'number',
          required: true,
          placeholder: 'Enter loan amount in INR'
        },
        {
          id: 'purpose',
          label: 'Purpose of Valuation',
          type: 'select',
          required: true,
          options: ['Home Loan', 'Mortgage', 'Insurance', 'Sale/Purchase', 'Legal']
        }
      ],
      bankId: bank1.id,
    },
  })

  const existingLegalForm = await prisma.form.findFirst({
    where: { formName: 'Legal Verification Form' }
  })
  const legalForm = existingLegalForm || await prisma.form.create({
    data: {
      formName: 'Legal Verification Form',
      fields: [
        {
          id: 'property_address',
          label: 'Property Address',
          type: 'textarea',
          required: true,
          placeholder: 'Enter complete property address'
        },
        {
          id: 'document_type',
          label: 'Document Type',
          type: 'select',
          required: true,
          options: ['Sale Deed', 'Title Deed', 'Lease Deed', 'Gift Deed', 'Partition Deed']
        },
        {
          id: 'verification_type',
          label: 'Verification Type',
          type: 'select',
          required: true,
          options: ['Title Verification', 'Document Authentication', 'Legal Opinion', 'Due Diligence']
        },
        {
          id: 'urgency',
          label: 'Urgency Level',
          type: 'select',
          required: true,
          options: ['Normal', 'Urgent', 'Critical']
        }
      ],
      bankId: bank2.id,
    },
  })

  console.log('✅ Forms created')

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Test Accounts:')
  console.log('Admin: admin@24lv.com / admin123')
  console.log('Valuator: valuator@24lv.com / admin123')
  console.log('Advocate: advocate@24lv.com / admin123')
  console.log('Bank User: bank@sbi.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })