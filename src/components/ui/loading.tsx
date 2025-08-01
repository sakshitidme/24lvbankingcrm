import { cn } from "@/lib/utils"
import { Building2, Loader2 } from "lucide-react"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  variant?: "spinner" | "dots" | "pulse" | "branded"
}

export function Loading({ 
  className, 
  size = "md", 
  text = "Loading...", 
  variant = "spinner" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  if (variant === "branded") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className={cn("animate-spin rounded-full border-4 border-blue-200 border-t-blue-600", sizeClasses[size])}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className={cn("text-blue-600", size === "sm" ? "h-2 w-2" : size === "md" ? "h-4 w-4" : "h-6 w-6")} />
          </div>
        </div>
        <p className={cn("font-medium text-gray-700", textSizeClasses[size])}>{text}</p>
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        {text && <span className={cn("ml-3 text-gray-600", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center space-x-3", className)}>
        <div className={cn("bg-blue-600 rounded-full animate-pulse", sizeClasses[size])}></div>
        {text && <span className={cn("text-gray-600", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center space-x-3", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && <span className={cn("text-gray-600", textSizeClasses[size])}>{text}</span>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Loading variant="branded" size="lg" text="Loading 24LV Platform..." />
    </div>
  )
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  )
}

export function CardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    </div>
  )
}