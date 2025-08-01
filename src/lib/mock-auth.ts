// Mock authentication for development when database is not available
export const mockUsers = [
  {
    id: 'admin-user-123',
    email: 'admin@24lv.com',
    firstName: 'Admin',
    lastName: 'User',
    permissions: ['admin'],
    bankId: 'test-bank-123',
    bank: { id: 'test-bank-123', name: '24LV Property Valuation' },
    walletBalance: 25000,
    isActive: true,
    password: 'admin123'
  },
  {
    id: 'bank-user-123',
    email: 'bank@sbi.com',
    firstName: 'Bank',
    lastName: 'User',
    permissions: ['bank_user'],
    bankId: 'sbi-bank-123',
    bank: { id: 'sbi-bank-123', name: 'State Bank of India' },
    walletBalance: 10000,
    isActive: true,
    password: 'admin123'
  },
  {
    id: 'valuator-user-123',
    email: 'valuator@24lv.com',
    firstName: 'Valuator',
    lastName: 'User',
    permissions: ['valuator'],
    bankId: 'test-bank-123',
    bank: { id: 'test-bank-123', name: '24LV Property Valuation' },
    walletBalance: 5000,
    isActive: true,
    password: 'admin123'
  },
  {
    id: 'advocate-user-123',
    email: 'advocate@24lv.com',
    firstName: 'Advocate',
    lastName: 'User',
    permissions: ['advocate'],
    bankId: 'test-bank-123',
    bank: { id: 'test-bank-123', name: '24LV Property Valuation' },
    walletBalance: 7500,
    isActive: true,
    password: 'admin123'
  }
]

export function findMockUser(email: string, password: string) {
  return mockUsers.find(user => 
    user.email === email && 
    user.password === password && 
    user.isActive
  )
}