'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Users, 
  FileText, 
  Search,
  Download,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  Building
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type Bank = {
  id: string
  name: string
  code: string
  address: string
  contactEmail: string
  contactPhone: string
  isActive: boolean
  users?: { id: string }[]
  branches?: { id: string }[]
}

export default function BanksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Always call hooks first - ALL hooks must be called before any conditional returns
  const { data: banks, isLoading, refetch } = api.bank.getAll.useQuery({ page: 1, limit: 100 })
  
  const createBankMutation = api.bank.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    }
  })

  const updateBankMutation = api.bank.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingBank(null)
    }
  })

  const deleteBankMutation = api.bank.delete.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  // Check if user has admin permissions
  const permissions = session?.user?.permissions || []
  const isAdmin = permissions.includes('admin')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return null
  }

  // Calculate bank statistics
  const bankStats = banks?.banks ? {
    total: banks.banks.length,
    totalUsers: banks.banks.reduce((sum, b) => sum + (b._count?.users || 0), 0),
    totalBranches: banks.banks.reduce((sum, b) => sum + ((b as any).branches?.length || 0), 0),
    totalRequests: banks.banks.reduce((sum, b) => sum + ((b._count as any)?.requests || 0), 0),
    totalForms: banks.banks.reduce((sum, b) => sum + (b._count?.forms || 0), 0),
    avgUsersPerBank: banks.banks.length > 0 ? Math.round(banks.banks.reduce((sum, b) => sum + (b._count?.users || 0), 0) / banks.banks.length) : 0
  } : {
    total: 0,
    totalUsers: 0,
    totalBranches: 0,
    totalRequests: 0,
    totalForms: 0,
    avgUsersPerBank: 0
  }

  // Filter banks based on search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredBanks = banks?.banks?.filter((bank: any) => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Use the calculated stats
  const totalBanks = bankStats.total
  const totalUsers = bankStats.totalUsers
  const totalBranches = bankStats.totalBranches
  const totalRequests = bankStats.totalRequests

  const handleCreateBank = (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
    }
    createBankMutation.mutate(data)
  }

  const handleUpdateBank = (formData: FormData) => {
    if (!editingBank) return
    
    const data = {
      id: editingBank.id,
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      address: formData.get('address') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: formData.get('contactPhone') as string,
    }
    updateBankMutation.mutate(data)
  }

  const BankForm = ({ bank, onSubmit }: { bank?: Bank, onSubmit: (formData: FormData) => void }) => (
    <form action={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Building className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-lg">Basic Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Bank Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={bank?.name || ''}
              required
              placeholder="Enter bank name"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">Bank Code</Label>
            <Input
              id="code"
              name="code"
              defaultValue={bank?.code || ''}
              required
              placeholder="e.g., SBI, HDFC, ICICI"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <MapPin className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-lg">Address Information</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">Complete Address</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={bank?.address || ''}
            required
            rows={3}
            placeholder="Enter complete bank address including city, state, and postal code"
            className="resize-none"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Phone className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-lg">Contact Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={bank?.contactEmail || ''}
              required
              placeholder="contact@bank.com"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Primary email for bank communications
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-sm font-medium">Contact Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={bank?.contactPhone || ''}
              required
              placeholder="+91-XX-XXXX-XXXX"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Primary phone number for bank
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
        <Button 
          type="submit" 
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {bank ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Update Bank
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Bank
            </>
          )}
        </Button>
      </div>
    </form>
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BankCard = ({ bank }: { bank: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{bank.name}</CardTitle>
              <div className="flex items-center mt-1">
                <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  {bank.code}
                </code>
                {bank.isActive && (
                  <div className="ml-2 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground line-clamp-2">{bank.address}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground truncate">{bank.contactEmail}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{bank.contactPhone}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {bank._count?.users || 0} users
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {bank._count?.requests || 0} requests
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingBank(bank)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to delete this bank? This will affect all associated users.')) {
                  deleteBankMutation.mutate({ id: bank.id })
                }
              }}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bank Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage partner banks and their information
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Bank</DialogTitle>
                <DialogDescription>
                  Register a new partner bank in the system with complete information.
                </DialogDescription>
              </DialogHeader>
              <BankForm onSubmit={handleCreateBank} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Banks
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBanks}</div>
            <p className="text-sm text-muted-foreground">
              Registered partners
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bank Users
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-sm text-muted-foreground">
              Total bank users
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Branches
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBranches}</div>
            <p className="text-sm text-muted-foreground">
              Bank branches
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequests}</div>
            <p className="text-sm text-muted-foreground">
              Valuation requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Bank Directory</CardTitle>
          <CardDescription>
            Search and manage all partner banks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search banks by name, code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading banks...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredBanks.map((bank: any) => (
                <BankCard key={bank.id} bank={bank} />
              ))}
              
              {filteredBanks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No banks found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Bank Name</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Users</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {filteredBanks.map((bank: any) => (
                    <TableRow key={bank.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <Building className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{bank.name}</p>
                            <p className="text-sm text-muted-foreground">{bank.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                          {bank.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                            {bank.contactEmail}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-2" />
                            {bank.contactPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-semibold text-blue-600">{bank._count?.users || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${bank.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm font-medium ${bank.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {bank.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBank(bank)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this bank? This will affect all associated users.')) {
                                deleteBankMutation.mutate({ id: bank.id })
                              }
                            }}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Bank Dialog */}
      <Dialog open={!!editingBank} onOpenChange={() => setEditingBank(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Bank</DialogTitle>
            <DialogDescription>
              Update bank information and contact details.
            </DialogDescription>
          </DialogHeader>
          {editingBank && <BankForm bank={editingBank} onSubmit={handleUpdateBank} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}