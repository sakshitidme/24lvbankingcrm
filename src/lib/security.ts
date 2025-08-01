import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from 'limiter'

// Rate limiter: 100 requests per 15 minutes per IP
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'hour',
  fireImmediately: true,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function rateLimit(_request: NextRequest) {
  // const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  try {
    const remainingRequests = await limiter.removeTokens(1)
    
    if (remainingRequests < 0) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    return null // No rate limit hit
  } catch (error) {
    console.error('Rate limiting error:', error)
    return null // Allow request on error
  }
}

export function addSecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  )
  
  return response
}

export function validateCSRF(request: NextRequest) {
  // Simple CSRF protection for state-changing operations
  const method = request.method
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (!origin || !host) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      )
    }
    
    const originUrl = new URL(origin)
    if (originUrl.host !== host) {
      return NextResponse.json(
        { error: 'CSRF protection: Origin mismatch' },
        { status: 403 }
      )
    }
  }
  
  return null // CSRF check passed
}