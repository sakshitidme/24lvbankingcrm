import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: string
    direction: "up" | "down"
  }
  className?: string
  iconColor?: string
  iconBgColor?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-50"
}: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 hover-professional", className)}>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-3xl font-bold mb-2">
          {value}
        </div>
        
        {(description || trend) && (
          <div className="flex items-center justify-between">
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center">
                {trend.direction === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  )
}