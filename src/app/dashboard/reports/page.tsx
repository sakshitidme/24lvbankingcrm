'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Clock,
  Eye,
  Share,
  Plus
} from 'lucide-react'

export default function ReportsPage() {
  const { data: session } = useSession()
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('30d')
  const [reportFormat, setReportFormat] = useState('pdf')

  // Mock reports data
  const reportTemplates = [
    {
      id: 'monthly-summary',
      name: 'Monthly Summary Report',
      description: 'Comprehensive monthly performance overview',
      category: 'Performance',
      icon: BarChart3,
      lastGenerated: '2025-07-20',
      frequency: 'Monthly'
    },
    {
      id: 'request-analysis',
      name: 'Request Analysis Report',
      description: 'Detailed analysis of request patterns and trends',
      category: 'Analytics',
      icon: PieChart,
      lastGenerated: '2025-07-22',
      frequency: 'Weekly'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Revenue, costs, and financial performance metrics',
      category: 'Financial',
      icon: DollarSign,
      lastGenerated: '2025-07-21',
      frequency: 'Monthly'
    },
    {
      id: 'bank-performance',
      name: 'Bank Performance Report',
      description: 'Individual bank performance and comparison',
      category: 'Performance',
      icon: Building2,
      lastGenerated: '2025-07-19',
      frequency: 'Quarterly'
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'User engagement and activity patterns',
      category: 'Analytics',
      icon: Users,
      lastGenerated: '2025-07-18',
      frequency: 'Weekly'
    },
    {
      id: 'operational-efficiency',
      name: 'Operational Efficiency',
      description: 'Process efficiency and performance metrics',
      category: 'Operations',
      icon: Clock,
      lastGenerated: '2025-07-17',
      frequency: 'Monthly'
    }
  ]

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Summary - June 2025',
      type: 'Monthly Summary Report',
      generatedAt: '2025-07-01T10:30:00Z',
      size: '2.4 MB',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: '2',
      name: 'Request Analysis - Week 29',
      type: 'Request Analysis Report',
      generatedAt: '2025-07-22T14:15:00Z',
      size: '1.8 MB',
      format: 'Excel',
      status: 'Ready'
    },
    {
      id: '3',
      name: 'Financial Summary Q2 2025',
      type: 'Financial Summary',
      generatedAt: '2025-07-21T09:45:00Z',
      size: '3.1 MB',
      format: 'PDF',
      status: 'Ready'
    },
    {
      id: '4',
      name: 'Bank Performance - Q2 2025',
      type: 'Bank Performance Report',
      generatedAt: '2025-07-19T16:20:00Z',
      size: '4.2 MB',
      format: 'PDF',
      status: 'Processing'
    }
  ]

  const reportCategories = ['All', 'Performance', 'Analytics', 'Financial', 'Operations']
  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ]

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
    { value: 'json', label: 'JSON Data' }
  ]

  const handleGenerateReport = () => {
    console.log('Generating report:', { selectedReport, dateRange, reportFormat })
    // TODO: Implement report generation
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (size: string) => {
    return size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and export data insights
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Report
        </Button>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Templates */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Available Report Templates
                  </CardTitle>
                  <CardDescription>
                    Choose from pre-built report templates or create a custom report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTemplates.map((template) => {
                      const IconComponent = template.icon
                      return (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedReport === template.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedReport(template.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{template.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {template.frequency}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Last: {formatDate(template.lastGenerated)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Configuration */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Configuration</CardTitle>
                  <CardDescription>
                    Configure your report parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selected Report</Label>
                    <p className="text-sm font-medium">
                      {selectedReport 
                        ? reportTemplates.find(t => t.id === selectedReport)?.name 
                        : 'No report selected'
                      }
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={reportFormat} onValueChange={setReportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formatOptions.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button 
                      onClick={handleGenerateReport}
                      disabled={!selectedReport}
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Reports Generated</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Size</span>
                    <span className="font-medium">2.8 MB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Reports
              </CardTitle>
              <CardDescription>
                Your recently generated reports and downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground">{report.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.generatedAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(report.size)}
                          </span>
                          <Badge 
                            variant={report.status === 'Ready' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Reports
              </CardTitle>
              <CardDescription>
                Manage automated report generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated report generation to receive regular insights
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}