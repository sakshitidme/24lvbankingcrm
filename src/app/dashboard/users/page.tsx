'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Download, 
  Users,
  Shield,
  Building,
  Wallet,
  Mail,
  Phone,
  Activity,
  UserCheck,
  UserX,
  Settings,
  Grid3X3,
  List,
  MoreHorizontal
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Use the actual API response type
type ApiUser = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phoneNo?: string | null
  permissions: string[]
  bankId?: string | null
  bank?: { id: string; name: string } | null
  isActive: boolean
  walletBalance: number
}

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Always call hooks first - ALL hooks must be called before any conditional returns
  const { data: users, isLoading, refetch } = api.user.getAll.useQuery({ page: 1, limit: 100 })
  const { data: banks } = api.bank.getAll.useQuery({ page: 1, limit: 100 })
  
  const createUserMutation = api.user.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    }
  })

  const updateUserMutation = api.user.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingUser(null)
    }
  })

  const deleteUserMutation = api.user.delete.useMutation({
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

  // Calculate user statistics (for future use)
  // const userStats = users?.users ? {
  //   total: users.users.length,
  //   active: users.users.filter(u => u.isActive).length,
  //   inactive: users.users.filter(u => !u.isActive).length,
  //   admins: users.users.filter(u => u.permissions.includes('admin')).length,
  //   valuers: users.users.filter(u => u.permissions.includes('valuer')).length,
  //   bankUsers: users.users.filter(u => u.bankId).length,
  //   totalWalletBalance: users.users.reduce((sum, u) => sum + Number(u.walletBalance || 0), 0)
  // } : {
  //   total: 0,
  //   active: 0,
  //   inactive: 0,
  //   admins: 0,
  //   valuers: 0,
  //   bankUsers: 0,
  //   totalWalletBalance: 0
  // }

  // Filter users based on search and filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredUsers = users?.users?.filter((user: any) => {
    const matchesSearch = 
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.permissions.includes(roleFilter)
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  }) || []

  // Stats for the header cards
  const totalUsers = users?.users?.length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeUsers = users?.users?.filter((user: any) => user.isActive).length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminUsers = users?.users?.filter((user: any) => user.permissions.includes('admin')).length || 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bankUsers = users?.users?.filter((user: any) => user.permissions.includes('bank')).length || 0

  const handleToggleStatus = (userId: string, isActive: boolean) => {
    // For now, just show a toast - implement actual API call when available
    console.log(`Toggle user ${userId} status to ${isActive}`)
  }

  const handleCreateUser = (formData: FormData) => {
    const data = {
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phoneNo: formData.get('phoneNo') as string || '',
      password: formData.get('password') as string,
      permissions: [formData.get('permissions') as string],
      bankId: formData.get('bankId') as string || undefined,
    }
    createUserMutation.mutate(data)
  }

  const handleUpdateUser = (formData: FormData) => {
    if (!editingUser) return
    
    const data = {
      id: editingUser.id,
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      permissions: [formData.get('permissions') as string],
      bankId: formData.get('bankId') as string || undefined,
    }
    updateUserMutation.mutate(data)
  }

  const UserForm = ({ user, onSubmit }: { user?: ApiUser, onSubmit: (formData: FormData) => void }) => (
    <form action={onSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Users className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-lg">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={user?.firstName || ''}
              placeholder="Enter first name"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user?.lastName || ''}
              placeholder="Enter last name"
              className="h-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Mail className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-lg">Contact Information</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email || ''}
            placeholder="Enter email address"
            className="h-10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNo" className="text-sm font-medium">Phone Number (Optional)</Label>
          <Input
            id="phoneNo"
            name="phoneNo"
            type="tel"
            defaultValue={user?.phoneNo || ''}
            placeholder="Enter phone number"
            className="h-10"
          />
        </div>
      </div>

      {/* Security */}
      {!user && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Shield className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-lg">Security</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter secure password"
              className="h-10"
              required
            />
            <p className="text-xs text-muted-foreground">
              Password should be at least 8 characters long
            </p>
          </div>
        </div>
      )}

      {/* Role & Permissions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-lg">Role & Permissions</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="permissions" className="text-sm font-medium">User Role</Label>
          <Select name="permissions" defaultValue={user?.permissions?.[0]}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">Full system access</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="bank">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Bank User</div>
                    <div className="text-xs text-muted-foreground">Bank representative</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="valuator">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Valuator</div>
                    <div className="text-xs text-muted-foreground">Property valuation expert</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="advocate">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Advocate</div>
                    <div className="text-xs text-muted-foreground">Legal services provider</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankId" className="text-sm font-medium">Associated Bank (Optional)</Label>
          <Select name="bankId" defaultValue={user?.bankId || ''}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select bank association" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground"></div>
                  <span>No Bank Association</span>
                </div>
              </SelectItem>
              {banks?.banks?.map((bank: { id: string; name: string }) => (
                <SelectItem key={bank.id} value={bank.id}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>{bank.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Associate user with a specific bank for role-based access
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t">
        <Button 
          type="submit" 
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {user ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Update User
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </>
          )}
        </Button>
      </div>
    </form>
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200'
      case 'bank': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'valuator': return 'bg-green-100 text-green-700 border-green-200'
      case 'advocate': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield
      case 'bank': return Building
      case 'valuator': return Activity
      case 'advocate': return Settings
      default: return Users
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage system users, roles, and permissions
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
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate permissions and role assignments.
                </DialogDescription>
              </DialogHeader>
              <UserForm onSubmit={handleCreateUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <p className="text-sm text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeUsers}</div>
            <p className="text-sm text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Users
            </CardTitle>
            <div className="p-2 bg-red-50 rounded-lg">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adminUsers}</div>
            <p className="text-sm text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bank Users
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bankUsers}</div>
            <p className="text-sm text-muted-foreground">
              Bank representatives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">User Directory</CardTitle>
          <CardDescription>
            Search, filter, and manage all system users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="bank">Bank User</SelectItem>
                <SelectItem value="valuator">Valuator</SelectItem>
                <SelectItem value="advocate">Advocate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Bank</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Wallet</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {filteredUsers.map((user: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const primaryRole = user.permissions[0] || 'user'
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`/placeholder-avatar.jpg`} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || 'N')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName || 'N/A'} {user.lastName || ''}</p>
                              <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                              {user.email}
                            </div>
                            {user.phoneNo && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 mr-2" />
                                {user.phoneNo}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.map((permission: string) => {
                              const PermissionIcon = getRoleIcon(permission)
                              return (
                                <Badge 
                                  key={permission} 
                                  className={`${getRoleColor(permission)} flex items-center gap-1`}
                                >
                                  <PermissionIcon className="h-3 w-3" />
                                  {permission}
                                </Badge>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.bank ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">{user.bank.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No Bank</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? 'default' : 'destructive'}
                            className="flex items-center gap-1 w-fit"
                          >
                            {user.isActive ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Wallet className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-semibold text-green-600">₹{user.walletBalance}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* toggleUserStatusMutation.mutate({ id: user.id }) */}}
                              className="hover:bg-yellow-50 hover:text-yellow-600"
                            >
                              {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  deleteUserMutation.mutate({ id: user.id })
                                }
                              }}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No users found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {filteredUsers.map((user: any) => {
                const primaryRole = user.permissions[0] || 'user'
                const roleColor = primaryRole === 'admin' ? 'bg-red-100 text-red-800' :
                                primaryRole === 'valuer' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'

                return (
                  <Card key={user.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={roleColor}>
                          {primaryRole}
                        </Badge>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {user.phoneNo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{user.phoneNo}</span>
                          </div>
                        )}
                        {user.bank && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{user.bank.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span>₹{user.walletBalance?.toLocaleString() || '0'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleStatus(user.id, !user.isActive)}
                          className="flex-1"
                        >
                          {user.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {filteredUsers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No users found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit User</DialogTitle>
            <DialogDescription>
              Update user information, permissions, and role assignments.
            </DialogDescription>
          </DialogHeader>
          {editingUser && <UserForm user={editingUser} onSubmit={handleUpdateUser} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}