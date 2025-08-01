// Production-ready mock data service - minimal demo data removed
export const mockForms: any[] = [
  // Demo data removed for production deployment
  // Forms will be created dynamically by users
]

export const mockFormsBackup: any[] = [
  {
    id: 'form-2',
    formName: 'Legal Document Review Form',
    description: 'Form for legal document review and verification',
    fields: [
      {
        id: 'field-4',
        fieldName: 'Document Type',
        fieldType: 'select',
        requiredFor: 'all',
        options: [
          { id: 'opt-4', option: 'Contract', value: 'contract' },
          { id: 'opt-5', option: 'Agreement', value: 'agreement' },
          { id: 'opt-6', option: 'Deed', value: 'deed' }
        ]
      },
      {
        id: 'field-5',
        fieldName: 'Document Description',
        fieldType: 'textarea',
        requiredFor: 'all',
        options: []
      }
    ],
    isDefaultForm: false,
    bankId: 'bank-1',
    userId: 'test-user-123',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    bank: {
      id: 'bank-1',
      name: 'Test Bank',
      code: 'TB001'
    },
    createdBy: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@24lv.com'
    },
    _count: {
      requests: 3
    }
  },
  {
    id: 'form-3',
    formName: 'Commercial Property Assessment',
    description: 'Comprehensive assessment form for commercial properties',
    fields: [
      {
        id: 'field-6',
        fieldName: 'Building Size',
        fieldType: 'number',
        requiredFor: 'all',
        options: []
      },
      {
        id: 'field-7',
        fieldName: 'Location Type',
        fieldType: 'select',
        requiredFor: 'all',
        options: [
          { id: 'opt-7', option: 'City Center', value: 'city_center' },
          { id: 'opt-8', option: 'Suburban', value: 'suburban' },
          { id: 'opt-9', option: 'Industrial Zone', value: 'industrial_zone' }
        ]
      }
    ],
    isDefaultForm: false,
    bankId: 'bank-2',
    userId: 'test-user-123',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    bank: {
      id: 'bank-2',
      name: 'Commercial Bank',
      code: 'CB002'
    },
    createdBy: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@24lv.com'
    },
    _count: {
      requests: 8
    }
  }
]

export const mockUsers = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@24lv.com',
    permissions: ['admin'],
    bankId: null,
    walletBalance: 1500.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    bank: null
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Valuator',
    email: 'valuator@24lv.com',
    permissions: ['valuator'],
    bankId: 'bank-1',
    walletBalance: 750.50,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    bank: {
      id: 'bank-1',
      name: 'Test Bank',
      code: 'TB001'
    }
  },
  {
    id: 'user-3',
    firstName: 'Bob',
    lastName: 'BankUser',
    email: 'bank@24lv.com',
    permissions: ['bank_user'],
    bankId: 'bank-1',
    walletBalance: 2000.00,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    bank: {
      id: 'bank-1',
      name: 'Test Bank',
      code: 'TB001'
    }
  }
]

export const mockBanks = [
  {
    id: 'bank-1',
    name: 'Test Bank',
    code: 'TB001',
    address: '123 Banking Street, Finance City',
    contactEmail: 'contact@testbank.com',
    contactPhone: '+1-555-0123',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    _count: {
      users: 15,
      forms: 8
    }
  },
  {
    id: 'bank-2',
    name: 'Commercial Bank',
    code: 'CB002',
    address: '456 Commerce Ave, Business District',
    contactEmail: 'info@commercialbank.com',
    contactPhone: '+1-555-0456',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    _count: {
      users: 22,
      forms: 12
    }
  },
  {
    id: 'bank-3',
    name: 'Regional Bank',
    code: 'RB003',
    address: '789 Regional Blvd, Metro Area',
    contactEmail: 'support@regionalbank.com',
    contactPhone: '+1-555-0789',
    isActive: false,
    createdAt: new Date('2024-02-01'),
    _count: {
      users: 8,
      forms: 3
    }
  }
]

export const mockRequests = [
  {
    id: 'req-1',
    title: 'Property Valuation - 123 Main St',
    description: 'Residential property valuation request',
    status: 'pending',
    priority: 'high',
    formId: 'form-1',
    createdByUserId: 'user-2',
    assignedToUserId: 'user-1',
    bankId: 'bank-1',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    form: mockForms[0],
    createdByUser: mockUsers[1],
    assignedToUser: mockUsers[0],
    bank: mockBanks[0]
  },
  {
    id: 'req-2',
    title: 'Legal Review - Commercial Contract',
    description: 'Review of commercial property purchase contract',
    status: 'in_progress',
    priority: 'medium',
    formId: 'form-2',
    createdByUserId: 'user-3',
    assignedToUserId: 'user-1',
    bankId: 'bank-1',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-12'),
    form: mockForms[1],
    createdByUser: mockUsers[2],
    assignedToUser: mockUsers[0],
    bank: mockBanks[0]
  }
]

// Mock data service functions
export const mockDataService = {
  // Forms
  getForms: (params: { page?: number; limit?: number; search?: string; bankId?: string; isDefaultForm?: boolean }) => {
    let filteredForms = [...mockForms]
    
    if (params.search) {
      filteredForms = filteredForms.filter(form => 
        form.formName.toLowerCase().includes(params.search!.toLowerCase()) ||
        form.description?.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    if (params.bankId) {
      filteredForms = filteredForms.filter(form => form.bankId === params.bankId)
    }
    
    if (params.isDefaultForm !== undefined) {
      filteredForms = filteredForms.filter(form => form.isDefaultForm === params.isDefaultForm)
    }
    
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit
    const paginatedForms = filteredForms.slice(skip, skip + limit)
    
    return {
      forms: paginatedForms,
      total: filteredForms.length,
      pages: Math.ceil(filteredForms.length / limit),
      currentPage: page
    }
  },
  
  getFormById: (id: string) => {
    return mockForms.find(form => form.id === id) || null
  },
  
  createForm: (data: any) => {
    console.log("Creating form with data:", data)
    const newForm = {
      id: `form-${Date.now()}`,
      formName: data.formName,
      name: data.formName,
      description: data.description || "",
      type: data.type || "custom",
      fields: data.fields || [],
      isDefaultForm: data.isDefaultForm || false,
      isActive: true,
      bankId: data.bankId || null,
      userId: "test-user-123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bank: data.bankId ? mockBanks.find(b => b.id === data.bankId) || null : null,
      createdBy: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@24lv.com"
      },
      _count: {
        requests: 0
      },
      submissions: 0
    }

    mockForms.push(newForm)
    console.log("Form created successfully:", newForm)
    console.log("Total forms now:", mockForms.length)
    return newForm
  },
  
  // Users
  getUsers: (params: { page?: number; limit?: number; search?: string; bankId?: string }) => {
    let filteredUsers = [...mockUsers]
    
    if (params.search) {
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(params.search!.toLowerCase()) ||
        user.lastName.toLowerCase().includes(params.search!.toLowerCase()) ||
        user.email.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    if (params.bankId) {
      filteredUsers = filteredUsers.filter(user => user.bankId === params.bankId)
    }
    
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(skip, skip + limit)
    
    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      pages: Math.ceil(filteredUsers.length / limit),
      currentPage: page
    }
  },
  
  // Banks
  getBanks: (params: { page?: number; limit?: number; search?: string }) => {
    let filteredBanks = [...mockBanks]
    
    if (params.search) {
      filteredBanks = filteredBanks.filter(bank => 
        bank.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        bank.code.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit
    const paginatedBanks = filteredBanks.slice(skip, skip + limit)
    
    return {
      banks: paginatedBanks,
      total: filteredBanks.length,
      pages: Math.ceil(filteredBanks.length / limit),
      currentPage: page
    }
  },
  
  // Requests
  getRequests: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    let filteredRequests = [...mockRequests]
    
    if (params.search) {
      filteredRequests = filteredRequests.filter(request => 
        request.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        request.description?.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    if (params.status) {
      filteredRequests = filteredRequests.filter(request => request.status === params.status)
    }
    
    const page = params.page || 1
    const limit = params.limit || 10
    const skip = (page - 1) * limit
    const paginatedRequests = filteredRequests.slice(skip, skip + limit)
    
    return {
      requests: paginatedRequests,
      total: filteredRequests.length,
      pages: Math.ceil(filteredRequests.length / limit),
      currentPage: page
    }
  },
  
  // Dashboard stats
  getDashboardStats: () => {
    return {
      totalRequests: mockRequests.length,
      pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
      assignedRequests: mockRequests.filter(r => r.status === 'in_progress').length,
      completedRequests: mockRequests.filter(r => r.status === 'completed').length,
      returnedRequests: mockRequests.filter(r => r.status === 'returned').length
    }
  }
}