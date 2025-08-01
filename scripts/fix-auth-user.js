#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function fixAuthUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Fixing authentication user...')
    
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Update the test user with proper password
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@24lv.com' },
      data: {
        password: hashedPassword
      }
    })
    
    console.log('✅ User password updated successfully')
    
    // Test the password
    const isValid = await bcrypt.compare('admin123', updatedUser.password)
    console.log(`🔑 Password verification: ${isValid ? '✅ Success' : '❌ Failed'}`)
    
  } catch (error) {
    console.error('❌ Failed to fix user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAuthUser().catch(console.error)