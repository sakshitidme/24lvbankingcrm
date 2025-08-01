// Temporary mock session for testing purposes
export const mockSession = {
  user: {
    id: 'test-user-123',
    email: 'admin@24lv.com',
    firstName: 'Test',
    lastName: 'Admin',
    permissions: ['admin'],
    bankId: 'test-bank-123', // Required field, using test value
    bank: null,
    walletBalance: 0,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

export const getMockSession = () => {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
    return mockSession
  }
  return null
}