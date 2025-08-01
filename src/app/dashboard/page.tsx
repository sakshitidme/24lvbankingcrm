'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/trpc'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  Eye,
  Building,
  FileBarChart,
  DollarSign,
  Activity,
  CreditCard,
  Download,
  ArrowRight,
  Zap,
  Target,
  Award
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: stats, isLoading } = api.request.getDashboardStats.useQuery()

  const permissions = session?.user?.permissions || []
  const isAdmin = permissions.includes('admin')
  const isValuator = permissions.includes('valuator')
  const isBankUser = permissions.includes('bank_user')

  const statCards = [
    {
      title: 'Total Requests',
      value: stats?.totalRequests || 0,
      icon: FileText,
      description: 'All requests in the system',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      icon: Clock,
      description: 'Awaiting assignment',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Assigned Requests',
      value: stats?.assignedRequests || 0,
      icon: AlertCircle,
      description: 'Currently being processed',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Completed Requests',
      value: stats?.completedRequests || 0,
      icon: CheckCircle,
      description: 'Successfully completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+23%',
      trend: 'up'
    },
  ]

  const quickActions = [
    {
      title: "Create New Request",
      description: "Submit a new valuation or legal request",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/requests/new"
    },
    {
      title: "Manage Forms",
      description: "Create and edit request forms",
      icon: FileBarChart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/forms"
    },
    {
      title: "View Analytics",
      description: "Check detailed performance metrics",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/dashboard/analytics"
    },
    {
      title: "Generate Report",
      description: "Create comprehensive reports",
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/dashboard/reports"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "request",
      title: "New valuation request submitted",
      description: "Property valuation for ₹2,50,000",
      time: "2 minutes ago",
      status: "pending",
      avatar: "VR"
    },
    {
      id: 2,
      type: "completion",
      title: "Request completed successfully",
      description: "Legal verification completed",
      time: "15 minutes ago",
      status: "success",
      avatar: "LC"
    },
    {
      id: 3,
      type: "assignment",
      title: "Request assigned to valuator",
      description: "Assigned to John Smith",
      time: "1 hour ago",
      status: "info",
      avatar: "JS"
    },
    {
      id: 4,
      type: "payment",
      title: "Payment processed",
      description: "₹15,000 payment completed",
      time: "2 hours ago",
      status: "success",
      avatar: "PP"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-blue-600">
            Welcome back, Admin!
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            {permissions[0] || 'User'} Account
          </Badge>
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-blue-600 text-white">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Account Info Card */}
      <Card className="border shadow-lg bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">admin@24lv.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank</p>
                <p className="font-semibold">
                  24LV Property Valuation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="font-semibold text-lg">
                  ₹25,000.00
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? '...' : stat.value}
                </div>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-muted"
                  asChild
                >
                  <a href={action.href}>
                    <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="text-left flex-1 break-words text-wrap w-full min-w-0">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Button>
              )
            })}

            {/* Admin Actions */}
            {isAdmin && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-3">Admin Actions</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-muted"
                  asChild
                >
                  <a href="/dashboard/users">
                    <div className="p-2 rounded-lg bg-purple-50 mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1 break-words text-wrap w-full min-w-0">
                      <div className="font-medium">Manage Users</div>
                      <div className="text-sm text-muted-foreground">
                        Add and manage system users
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-muted mt-2"
                  asChild
                >
                  <a href="/dashboard/banks">
                    <div className="p-2 rounded-lg bg-orange-50 mr-3">
                      <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left flex-1 break-words text-wrap w-full min-w-0">
                      <div className="font-medium">Manage Banks</div>
                      <div className="text-sm text-muted-foreground">
                        Add and manage bank information
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates and actions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`
                      ${activity.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                      ${activity.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
                      ${activity.status === 'info' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <div className="flex items-center">
                        {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.status === 'pending' && <Clock className="h-4 w-4 text-orange-500" />}
                        {activity.status === 'info' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Performance Overview</CardTitle>
              <CardDescription>
                Monthly performance metrics and trends
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Details
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center border">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Performance Chart
              </p>
              <p className="text-sm text-muted-foreground">
                Chart visualization will be implemented here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
