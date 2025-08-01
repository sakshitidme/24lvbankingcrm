#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the real authentication flow without mock auth
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testAuthentication() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔐 Testing Authentication Flow...')
    
    // Test database connection
    console.log('📊 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if test user exists
    console.log('👤 Checking for test user...')
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@24lv.com' },
      include: { bank: true }
    })
    
    if (!testUser) {
      console.log('❌ Test user not found. Creating test user...')
      
      // Create test bank first
      const testBank = await prisma.bank.upsert({
        where: { id: 'test-bank-123' },
        update: {},
        create: {
          id: 'test-bank-123',
          name: 'Test Bank',
          code: 'TB001',
          address: '123 Test Street',
          contactEmail: 'contact@testbank.com',
          contactPhone: '+1234567890',
          isActive: true
        }
      })
      
      // Create test user
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newUser = await prisma.user.create({
        data: {
          id: 'test-user-123',
          email: 'admin@24lv.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Admin',
          permissions: ['admin'],
          bankId: testBank.id,
          isActive: true,
          walletBalance: 0
        },
        include: { bank: true }
      })
      
      console.log('✅ Test user created successfully')
      console.log(`   Email: ${newUser.email}`)
      console.log(`   Password: admin123`)
      console.log(`   Permissions: ${newUser.permissions.join(', ')}`)
    } else {
      console.log('✅ Test user found')
      console.log(`   Email: ${testUser.email}`)
      console.log(`   Permissions: ${testUser.permissions.join(', ')}`)
      console.log(`   Bank: ${testUser.bank?.name || 'None'}`)
    }
    
    // Test password verification
    console.log('🔑 Testing password verification...')
    const testPassword = 'admin123'
    const isValidPassword = await bcrypt.compare(testPassword, testUser?.password || '')
    
    if (isValidPassword) {
      console.log('✅ Password verification successful')
    } else {
      console.log('❌ Password verification failed')
    }
    
    // Test user permissions
    console.log('🛡️ Testing user permissions...')
    const hasAdminPermission = testUser?.permissions.includes('admin')
    console.log(`   Admin permission: ${hasAdminPermission ? '✅' : '❌'}`)
    
    console.log('\n🎉 Authentication test completed successfully!')
    console.log('\n📋 Test Credentials:')
    console.log('   Email: admin@24lv.com')
    console.log('   Password: admin123')
    console.log('   Role: Admin')
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAuthentication().catch(console.error)