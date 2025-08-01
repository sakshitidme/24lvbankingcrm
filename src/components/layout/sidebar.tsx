'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  User,

  Wallet,
  BarChart3,
  ChevronDown,
  Bell,
  Search,
  Zap,
  Shield,
  CreditCard,
  HelpCircle,
  Star,

} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const permissions = session?.user?.permissions || []
  const isAdmin = permissions.includes('admin')

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true,
      badge: null,
      description: 'Overview & analytics'
    },
    {
      name: 'Requests',
      href: '/dashboard/requests',
      icon: FileText,
      show: true,
      badge: '12',
      description: 'Manage requests'
    },
    {
      name: 'Forms',
      href: '/dashboard/forms',
      icon: BarChart3,
      show: true,
      badge: null,
      description: 'Form templates'
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      show: isAdmin,
      badge: null,
      description: 'User management'
    },
    {
      name: 'Banks',
      href: '/dashboard/banks',
      icon: Building2,
      show: isAdmin,
      badge: null,
      description: 'Bank management'
    },
    {
      name: 'Wallet',
      href: '/dashboard/wallet',
      icon: Wallet,
      show: !isAdmin,
      badge: null,
      description: 'Wallet & payments'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      show: true,
      badge: null,
      description: 'Account settings'
    },
  ]

  const filteredNavigation = navigation.filter(item => item.show)

  return (
    <div className={cn('flex flex-col h-full bg-white text-gray-900 border-r border-gray-200 shadow-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">24</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-xl text-blue-600">
                24LV
              </h1>
              <p className="text-xs text-gray-600">Legal & Valuation</p>
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* User Info Card */}
      {!isCollapsed && (
        <div className="p-4 mx-4 mt-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-blue-600 text-white">
                {session?.user?.firstName?.[0]}{session?.user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.firstName} {session?.user?.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {session?.user?.email}
              </p>
              <div className="flex items-center mt-1">
                <Badge variant="secondary" className="text-xs bg-blue-600 text-white border-blue-500">
                  {permissions[0] || 'User'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Wallet Balance */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-700">Wallet</span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                ₹{session?.user?.walletBalance || '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {!isCollapsed ? 'Main Menu' : ''}
        </div>
        
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
              )}
              
              <div className={cn(
                'p-2 rounded-lg transition-colors',
                isActive 
                  ? 'bg-blue-700' 
                  : 'bg-gray-100 group-hover:bg-blue-100'
              )}>
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                )} />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="block">{item.name}</span>
                    <span className={cn(
                      'text-xs transition-colors',
                      isActive 
                        ? 'text-blue-100' 
                        : 'text-gray-500 group-hover:text-blue-600'
                    )}>
                      {item.description}
                    </span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-red-500 text-white text-xs px-2 py-1">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          )
        })}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Quick Actions
            </div>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-3" />
                New Request
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                size="sm"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Support
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        {/* Upgrade Card - Hidden for admin users */}
        {!isCollapsed && !isAdmin && false && (
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-gray-700 mb-3">
              Get unlimited requests and priority support
            </p>
            <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
              Upgrade Now
            </Button>
          </div>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-gray-700 hover:text-blue-700 hover:bg-blue-50 p-3"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {session?.user?.firstName?.[0]}{session?.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      {session?.user?.firstName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {permissions[0] || 'User'}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronDown className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
            <DropdownMenuLabel className="text-gray-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem asChild className="text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-700 hover:text-blue-700 hover:bg-blue-50">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}