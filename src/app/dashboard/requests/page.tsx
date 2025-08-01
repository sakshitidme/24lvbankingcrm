'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Eye, Edit, FileText, Clock, CheckCircle, AlertCircle, Search, Filter, Calendar, User, MoreHorizontal, List, Kanban } from 'lucide-react'
import { Loading, TableLoading } from '@/components/ui/loading'
import { TableEmptyState } from '@/components/ui/empty-state'
import { StatsCard, StatsGrid } from '@/components/ui/stats-card'

interface Request {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  createdAt: string
  assignedTo?: { firstName: string; lastName: string }
  form?: { name: string; type: string }
  fields?: { [key: string]: string }
}

export default function RequestsPage() {
  const { data: session } = useSession()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  const permissions = session?.user?.permissions || []
  const isAdmin = permissions.includes('admin')

  const { data: requests, isLoading, refetch } = api.request.getAll.useQuery({ page: 1, limit: 100 })
  const { data: forms } = api.form.getAll.useQuery({ page: 1, limit: 100 })
  const { data: users } = api.user.getAll.useQuery({ page: 1, limit: 100 })
  
  const createRequestMutation = api.request.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
    }
  })

  // const updateRequestMutation = api.request.update.useMutation({
  //   onSuccess: () => {
  //     refetch()
  //     setSelectedRequest(null)
  //   }
  // })

  const assignRequestMutation = api.request.assign.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  const handleCreateRequest = (formData: FormData) => {
    const data = {
      formId: formData.get('formId') as string,
      fields: [], // Form fields would be collected from dynamic form
      forWhom: 'both' as const,
      bankId: formData.get('bankId') as string || 'temp-bank-id',
      bankBranchesId: formData.get('bankBranchesId') as string || undefined,
    }
    createRequestMutation.mutate(data)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'assigned':
        return <AlertCircle className="h-4 w-4" />
      case 'in_progress':
        return <FileText className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredRequests = requests?.requests?.filter((request: any) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.form?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Calculate stats
  const allRequests = requests?.requests || []
  const stats = {
    total: allRequests.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pending: allRequests.filter((r: any) => r.status === 'pending').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assigned: allRequests.filter((r: any) => r.status === 'assigned').length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    completed: allRequests.filter((r: any) => r.status === 'completed').length,
  }

  if (isLoading) {
    return <Loading variant="branded" size="lg" text="Loading requests..." />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Request Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage valuation and legal service requests efficiently
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-5 w-5 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
              <DialogDescription>
                Submit a new valuation or legal service request.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateRequest} className="space-y-4">
              <div>
                <Label htmlFor="formId">Form Type</Label>
                <Select name="formId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select form type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {forms?.forms?.map((form: any) => (
                      <SelectItem key={form.id} value={form.id}>
                        {form.formName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Request Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Enter request title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Provide additional details"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Create Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <StatsGrid>
        <StatsCard
          title="Total Requests"
          value={stats.total}
          description="All requests in system"
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          description="Awaiting assignment"
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-50"
          trend={{ value: "-5%", direction: "down" }}
        />
        <StatsCard
          title="Assigned"
          value={stats.assigned}
          description="Currently processing"
          icon={User}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
          trend={{ value: "+8%", direction: "up" }}
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          description="Successfully finished"
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend={{ value: "+23%", direction: "up" }}
        />
      </StatsGrid>

      {/* Enhanced Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Requests</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, ID, or form type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>View Mode</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <Kanban className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Display */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Requests
                <Badge variant="outline" className="ml-2">
                  {viewMode === 'table' ? 'Table View' : 'Kanban View'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {filteredRequests?.length || 0} of {stats.total} requests found
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {filteredRequests?.length || 0} results
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableLoading rows={8} />
          ) : filteredRequests?.length === 0 ? (
            <TableEmptyState
              title="No requests found"
              description="No requests match your current filters. Try adjusting your search criteria."
              action={{
                label: "Create New Request",
                onClick: () => setIsCreateDialogOpen(true)
              }}
            />
          ) : viewMode === 'table' ? (
            <RequestsTable 
              requests={filteredRequests || []}
              onViewRequest={setSelectedRequest}
              onEditRequest={() => alert('Request editing coming soon!')}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              isAdmin={isAdmin}
              currentUser={session?.user}
            />
          ) : (
            <RequestsKanban 
              requests={filteredRequests || []}
              onViewRequest={setSelectedRequest}
              onEditRequest={() => alert('Request editing coming soon!')}
              getStatusIcon={getStatusIcon}
              isAdmin={isAdmin}
              currentUser={session?.user}
            />
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View and manage request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Request ID</Label>
                  <p className="font-mono text-sm">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label>Title</Label>
                  <p>{selectedRequest.title}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge 
                    variant={selectedRequest.priority === 'urgent' ? 'destructive' : 
                            selectedRequest.priority === 'high' ? 'default' : 'secondary'}
                  >
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Form Type</Label>
                  <p>{selectedRequest.form?.name || 'Unknown'}</p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p>
                    {selectedRequest.assignedTo ? 
                      `${selectedRequest.assignedTo.firstName} ${selectedRequest.assignedTo.lastName}` : 
                      'Unassigned'
                    }
                  </p>
                </div>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedRequest.description}</p>
                </div>
              )}

              {isAdmin && selectedRequest.status === 'pending' && (
                <div>
                  <Label>Assign to Professional</Label>
                  <Select
                    onValueChange={(userId) => {
                      assignRequestMutation.mutate({
                        requestId: selectedRequest.id,
                        assignedValuator: userId
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select professional" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {users?.users?.filter((user: any) => 
                        user.permissions.includes('valuator') || 
                        user.permissions.includes('advocate')
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ).map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.permissions.join(', ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component: Requests Table
function RequestsTable({ 
  requests, 
  onViewRequest, 
  onEditRequest, 
  getStatusIcon, 
  getStatusColor, 
  isAdmin, 
  currentUser 
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requests: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewRequest: (request: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRequest: (request: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStatusIcon: (status: string) => any
  getStatusColor: (status: string) => string
  isAdmin: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any
}) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Request ID</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Assigned To</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {requests.map((request: any, index: number) => (
            <TableRow key={request.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {request.id.slice(0, 8)}...
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={request.title}>
                  {request.title}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {request.form?.type || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-2 capitalize">{request.status.replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={request.priority === 'urgent' ? 'destructive' : 
                          request.priority === 'high' ? 'default' : 'secondary'}
                  className="font-medium"
                >
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {request.assignedTo ? (
                    <>
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {request.assignedTo.firstName[0]}
                      </div>
                      <span className="text-sm">
                        {request.assignedTo.firstName} {request.assignedTo.lastName}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">Unassigned</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewRequest(request)}
                    className="hover:bg-blue-50 hover:border-blue-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(isAdmin || request.assignedTo?.firstName === currentUser?.firstName) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRequest(request)}
                      className="hover:bg-green-50 hover:border-green-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Component: Requests Kanban
function RequestsKanban({ 
  requests, 
  onViewRequest, 
  onEditRequest, 
  getStatusIcon, 
  isAdmin, 
  currentUser 
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requests: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewRequest: (request: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditRequest: (request: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStatusIcon: (status: string) => any
  isAdmin: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any
}) {
  const columns = [
    { id: 'pending', title: 'Pending', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'assigned', title: 'Assigned', color: 'bg-blue-50 border-blue-200' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-orange-50 border-orange-200' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
  ]

  const getRequestsByStatus = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return requests.filter((request: any) => request.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {getStatusIcon(column.id)}
              {column.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {getRequestsByStatus(column.id).length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {getRequestsByStatus(column.id).map((request: any) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2" title={request.title}>
                        {request.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onViewRequest(request)}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-xs">
                        {request.form?.type || 'Unknown'}
                      </Badge>
                      <Badge 
                        variant={request.priority === 'urgent' ? 'destructive' : 
                                request.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {request.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {request.assignedTo ? (
                          <>
                            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {request.assignedTo.firstName[0]}
                            </div>
                            <span className="text-xs text-gray-600 truncate max-w-20">
                              {request.assignedTo.firstName}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">Unassigned</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRequest(request)}
                        className="flex-1 text-xs h-7"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {(isAdmin || request.assignedTo?.firstName === currentUser?.firstName) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditRequest(request)}
                          className="flex-1 text-xs h-7"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getRequestsByStatus(column.id).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {column.title.toLowerCase()} requests</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}