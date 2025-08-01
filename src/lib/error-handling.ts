import { toast } from 'sonner'

export interface AppError {
  code: string
  message: string
  details?: string
  field?: string
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class APIError extends Error {
  constructor(
    public message: string,
    public code: string = 'API_ERROR',
    public status?: number
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const errorMessages = {
  // Form validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_URL: 'Please enter a valid URL',
  
  // API errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'A conflict occurred. The resource may already exist.',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions to perform this action.',
  INVALID_OPERATION: 'This operation is not allowed in the current state.',
  QUOTA_EXCEEDED: 'You have exceeded your quota limit.',
  
  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
}

export const validateField = (value: unknown, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    const error = rule.validate(value)
    if (error) return error
  }
  return null
}

export interface ValidationRule {
  validate: (value: unknown) => string | null
}

export const validationRules = {
  required: (): ValidationRule => ({
    validate: (value) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return errorMessages.REQUIRED_FIELD
      }
      return null
    }
  }),
  
  email: (): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(String(value)) ? null : errorMessages.INVALID_EMAIL
    }
  }),
  
  phone: (): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
      return phoneRegex.test(String(value)) ? null : errorMessages.INVALID_PHONE
    }
  }),
  
  minLength: (min: number): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      return String(value).length >= min ? null : `Must be at least ${min} characters long`
    }
  }),
  
  maxLength: (max: number): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      return String(value).length <= max ? null : `Must be no more than ${max} characters long`
    }
  }),
  
  minValue: (min: number): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return null
      const num = Number(value)
      return num >= min ? null : `Must be at least ${min}`
    }
  }),
  
  maxValue: (max: number): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return null
      const num = Number(value)
      return num <= max ? null : `Must be no more than ${max}`
    }
  }),
  
  url: (): ValidationRule => ({
    validate: (value) => {
      if (!value) return null
      try {
        new URL(String(value))
        return null
      } catch {
        return errorMessages.INVALID_URL
      }
    }
  })
}

export const handleError = (error: unknown, context?: string) => {
  console.error(`Error in ${context || 'application'}:`, error)
  
  if (error instanceof ValidationError) {
    toast.error(`Validation Error: ${error.message}`)
    return
  }
  
  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        toast.error(errorMessages.UNAUTHORIZED)
        break
      case 403:
        toast.error(errorMessages.FORBIDDEN)
        break
      case 404:
        toast.error(errorMessages.NOT_FOUND)
        break
      case 409:
        toast.error(errorMessages.CONFLICT)
        break
      case 500:
        toast.error(errorMessages.SERVER_ERROR)
        break
      default:
        toast.error(error.message || errorMessages.UNKNOWN_ERROR)
    }
    return
  }
  
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      toast.error(errorMessages.NETWORK_ERROR)
      return
    }
    
    if (error.message.includes('timeout')) {
      toast.error(errorMessages.TIMEOUT_ERROR)
      return
    }
    
    toast.error(error.message || errorMessages.UNKNOWN_ERROR)
    return
  }
  
  toast.error(errorMessages.UNKNOWN_ERROR)
}

export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}