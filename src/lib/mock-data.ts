// Production-ready mock data service - demo data removed for live deployment
export const mockForms: any[] = []

export const mockUsers = [
  {
    id: 'admin-user',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@24lv.com',
    permissions: ['admin'],
    bankId: null,
    walletBalance: 0.00,
    isActive: true,
    createdAt: new Date(),
    bank: null
  }
]

export const mockBanks: any[] = []
export const mockRequests: any[] = []

// Production-ready mock data service functions
export const mockDataService = {
  // Forms
  getForms: (params: { page?: number; limit?: number; search?: string; bankId?: string; isDefaultForm?: boolean }) => {
    let filteredForms = [...mockForms]
    
    if (params.search) {
      filteredForms = filteredForms.filter(form => 
        form.formName?.toLowerCase().includes(params.search!.toLowerCase()) ||
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
    const limit = params.limit || 20
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
      formName: data.formName || data.name,
      name: data.formName || data.name,
      description: data.description || "",
      type: data.type || "custom",
      fields: data.fields || [],
      isDefaultForm: data.isDefaultForm || false,
      isActive: true,
      bankId: data.bankId || null,
      userId: "admin-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bank: null,
      createdBy: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@24lv.com"
      },
      _count: {
        requests: 0
      },
      submissions: 0,
      category: data.category || 'custom'
    }

    mockForms.push(newForm)
    console.log("Form created successfully:", newForm)
    console.log("Total forms now:", mockForms.length)
    return newForm
  },

  updateForm: (id: string, data: any) => {
    const formIndex = mockForms.findIndex(form => form.id === id)
    if (formIndex !== -1) {
      mockForms[formIndex] = {
        ...mockForms[formIndex],
        ...data,
        updatedAt: new Date().toISOString()
      }
      return mockForms[formIndex]
    }
    return null
  },

  deleteForm: (id: string) => {
    const formIndex = mockForms.findIndex(form => form.id === id)
    if (formIndex !== -1) {
      const deletedForm = mockForms.splice(formIndex, 1)[0]
      return deletedForm
    }
    return null
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
    const limit = params.limit || 20
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
        bank.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
        bank.code?.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    const page = params.page || 1
    const limit = params.limit || 20
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
        request.title?.toLowerCase().includes(params.search!.toLowerCase()) ||
        request.description?.toLowerCase().includes(params.search!.toLowerCase())
      )
    }
    
    if (params.status) {
      filteredRequests = filteredRequests.filter(request => request.status === params.status)
    }
    
    const page = params.page || 1
    const limit = params.limit || 20
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