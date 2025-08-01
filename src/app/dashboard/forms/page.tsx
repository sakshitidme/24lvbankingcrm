'use client'

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Layout, 
  Settings, 
  BarChart3, 
  Download, 
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Zap,
  Palette
} from 'lucide-react'

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  name: string
  formName: string
  description: string
  type: string
  fields: FormField[]
  isDefaultForm: boolean
  isActive: boolean
  bankId?: string
  bank?: { id: string; name: string }
  createdAt?: string
  updatedAt?: string
  submissions?: number
  category?: string
}

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Form creation state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('valuation')
  const [formDescription, setFormDescription] = useState('')

  // API calls
  const { data: forms, isLoading, refetch } = api.form.getAll.useQuery(
    { page: 1, limit: 20 },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    }
  )
  
  const createFormMutation = api.form.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateDialogOpen(false)
      setFormName('')
      setFormType('valuation')
      setFormDescription('')
    },
    onError: (error) => {
      console.error('Form creation error:', error)
    }
  })

  const updateFormMutation = api.form.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingForm(null)
    }
  })

  const deleteFormMutation = api.form.delete.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  // Calculate stats
  const allForms = forms?.forms || []
  const stats = {
    total: allForms.length,
    active: allForms.filter((f: any) => f.isActive).length,
    templates: 3, // Static for now
    submissions: allForms.reduce((sum: number, f: any) => sum + (f.submissions || 0), 0),
  }

  // Filter forms
  const filteredForms = allForms.filter((form: any) => {
    const matchesSearch = searchQuery === '' || 
      form.formName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.type?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || form.type === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating form with:', { formName, formType, formDescription })
    
    createFormMutation.mutate({
      formName,
      description: formDescription,
      fields: [],
      isDefaultForm: false,
    })
  }

  const handleUpdateForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingForm) return
    
    // Convert FormField[] to the expected format
    const convertedFields = (editingForm.fields || []).map(field => ({
      id: field.id,
      fieldName: field.label,
      fieldType: field.type,
      requiredFor: field.required ? 'all' : 'none',
      options: field.options?.map((option, index) => ({
        id: `${field.id}-option-${index}`,
        option: option,
        value: option,
      })),
    }))
    
    updateFormMutation.mutate({
      id: editingForm.id,
      formName,
      fields: convertedFields,
      isDefaultForm: editingForm.isDefaultForm || false,
    })
  }

  const openEditDialog = (form: Form) => {
    setEditingForm(form)
    setFormName(form.formName || form.name)
    setFormType(form.type || 'valuation')
    setFormDescription(form.description || '')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading forms...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Form Builder Studio
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Create, manage, and deploy dynamic forms with advanced features
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-5 w-5 mr-2" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Form
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Build a dynamic form with custom fields and advanced features
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateForm} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="formName" className="text-sm font-medium text-gray-900">
                      Form Name *
                    </Label>
                    <Input
                      id="formName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter form name"
                      required
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="formType" className="text-sm font-medium text-gray-900">
                      Form Type
                    </Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger className="mt-1 bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="valuation">Valuation</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="banking">Banking</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="formDescription" className="text-sm font-medium text-gray-900">
                      Description
                    </Label>
                    <Textarea
                      id="formDescription"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Enter form description"
                      rows={3}
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="bg-white border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createFormMutation.isPending || !formName.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {createFormMutation.isPending ? 'Creating...' : 'Create Form'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All forms in system</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Forms</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <p className="text-xs text-gray-500 mt-1">Currently published</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Templates</CardTitle>
            <Layout className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.templates}</div>
            <p className="text-xs text-gray-500 mt-1">Ready-to-use templates</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.submissions}</div>
            <p className="text-xs text-gray-500 mt-1">Total form submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Forms</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="valuation">Valuation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>View Mode</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forms List */}
          {filteredForms.length === 0 ? (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchQuery || categoryFilter !== 'all' 
                    ? 'No forms match your current filters.' 
                    : 'Get started by creating your first form.'
                  }
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form: any) => (
                <Card key={form.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {form.formName || form.name}
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                          {form.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant={form.isActive ? 'default' : 'secondary'}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{form.type || 'Custom'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fields:</span>
                        <span className="font-medium">{form.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(form)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteFormMutation.mutate({ id: form.id })}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form: any) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{form.formName || form.name}</div>
                          <div className="text-sm text-gray-500">{form.description || 'No description'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{form.type || 'Custom'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={form.isActive ? 'default' : 'secondary'}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{form.fields?.length || 0} fields</TableCell>
                      <TableCell>
                        {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(form)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteFormMutation.mutate({ id: form.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
              <CardDescription>Choose from pre-built templates to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Property Valuation</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Standard property valuation form</p>
                    <Button size="sm">Use Template</Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Legal Verification</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Legal document verification form</p>
                    <Button size="sm">Use Template</Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Bank Application</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Bank loan application form</p>
                    <Button size="sm">Use Template</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Form Builder</CardTitle>
              <CardDescription>Drag and drop form fields to build your custom form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Form Builder Coming Soon</h3>
                <p className="text-gray-500">Advanced form builder with drag-and-drop functionality</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Form Analytics</CardTitle>
              <CardDescription>Track form performance and submission metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-500">Detailed analytics and reporting for your forms</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingForm} onOpenChange={() => setEditingForm(null)}>
        <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Form
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update form configuration and fields
            </DialogDescription>
          </DialogHeader>
          
          {editingForm && (
            <form onSubmit={handleUpdateForm} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editFormName" className="text-sm font-medium text-gray-900">
                    Form Name *
                  </Label>
                  <Input
                    id="editFormName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter form name"
                    required
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editFormType" className="text-sm font-medium text-gray-900">
                    Form Type
                  </Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="mt-1 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="valuation">Valuation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="editFormDescription" className="text-sm font-medium text-gray-900">
                    Description
                  </Label>
                  <Textarea
                    id="editFormDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description"
                    rows={3}
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingForm(null)}
                  className="bg-white border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateFormMutation.isPending || !formName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {updateFormMutation.isPending ? 'Updating...' : 'Update Form'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}