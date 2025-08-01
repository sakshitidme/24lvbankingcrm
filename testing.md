# 24LV Property Valuation Platform - Testing Guide

## 🧪 Testing Strategy

### Testing Pyramid

1. **Unit Tests (70%)**
   - Individual component testing
   - Utility function testing
   - Business logic validation

2. **Integration Tests (20%)**
   - API endpoint testing
   - Database integration
   - Third-party service integration

3. **End-to-End Tests (10%)**
   - User journey testing
   - Critical path validation
   - Cross-browser testing

### Test Setup

#### Install Testing Dependencies
```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  jest-environment-jsdom \
  @types/jest \
  playwright \
  @playwright/test
```

#### Jest Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### Jest Setup (`jest.setup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
    }
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        permissions: ['admin'],
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock tRPC
jest.mock('@/lib/trpc', () => ({
  api: {
    user: {
      getAll: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          error: null,
        }),
      },
    },
  },
}))
```

### Unit Tests

#### Component Testing Example
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

#### Utility Function Testing
```typescript
// src/lib/__tests__/validation.test.ts
import { validateField, validationRules } from '@/lib/error-handling'

describe('Validation Functions', () => {
  describe('email validation', () => {
    it('validates correct email format', () => {
      const result = validateField('test@example.com', [validationRules.email()])
      expect(result).toBeNull()
    })

    it('rejects invalid email format', () => {
      const result = validateField('invalid-email', [validationRules.email()])
      expect(result).toBe('Please enter a valid email address')
    })
  })

  describe('required field validation', () => {
    it('passes for non-empty values', () => {
      const result = validateField('value', [validationRules.required()])
      expect(result).toBeNull()
    })

    it('fails for empty values', () => {
      const result = validateField('', [validationRules.required()])
      expect(result).toBe('This field is required')
    })
  })
})
```

### Integration Tests

#### API Route Testing
```typescript
// src/pages/api/__tests__/users.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/users'

describe('/api/users', () => {
  it('returns users list for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(Array.isArray(data)).toBe(true)
  })

  it('creates new user for POST request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.email).toBe('john@example.com')
  })
})
```

### End-to-End Tests

#### Playwright Configuration (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### E2E Test Example
```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create new user', async ({ page }) => {
    await page.goto('/dashboard/users')
    await page.click('text=Add User')
    
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.selectOption('[name="role"]', 'valuer')
    
    await page.click('button:has-text("Create User")')
    
    await expect(page.locator('text=User created successfully')).toBeVisible()
    await expect(page.locator('text=john@example.com')).toBeVisible()
  })

  test('should edit existing user', async ({ page }) => {
    await page.goto('/dashboard/users')
    await page.click('[data-testid="edit-user-1"]')
    
    await page.fill('[name="firstName"]', 'Jane')
    await page.click('button:has-text("Save Changes")')
    
    await expect(page.locator('text=User updated successfully')).toBeVisible()
    await expect(page.locator('text=Jane')).toBeVisible()
  })
})
```

### Performance Testing

#### Load Testing with Artillery
```yaml
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "User Journey"
    flow:
      - get:
          url: "/"
      - post:
          url: "/api/auth/signin"
          json:
            email: "test@example.com"
            password: "password"
      - get:
          url: "/dashboard"
      - get:
          url: "/dashboard/forms"
```

### Test Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:load": "artillery run artillery.yml"
  }
}
```

### Continuous Integration

#### GitHub Actions (`.github/workflows/test.yml`)
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Testing Checklist

#### Unit Tests
- [ ] Component rendering
- [ ] User interactions
- [ ] Props validation
- [ ] State management
- [ ] Utility functions
- [ ] Error handling

#### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] Authentication flow
- [ ] File uploads
- [ ] Email sending
- [ ] External API calls

#### E2E Tests
- [ ] User registration
- [ ] Login/logout flow
- [ ] Form creation
- [ ] Form submission
- [ ] User management
- [ ] Bank management
- [ ] Settings updates

#### Performance Tests
- [ ] Page load times
- [ ] API response times
- [ ] Database query performance
- [ ] Memory usage
- [ ] Concurrent user handling

#### Security Tests
- [ ] Authentication bypass
- [ ] Authorization checks
- [ ] Input validation
- [ ] SQL injection
- [ ] XSS prevention
- [ ] CSRF protection

### Test Data Management

#### Test Database Setup
```typescript
// tests/setup/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const setupTestData = async () => {
  // Create test users
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        permissions: ['admin'],
      },
      {
        email: 'valuer@test.com',
        firstName: 'Valuer',
        lastName: 'User',
        permissions: ['valuer'],
      },
    ],
  })
}

export const cleanupTestData = async () => {
  await prisma.user.deleteMany()
  await prisma.$disconnect()
}
```

### Best Practices

1. **Test Organization:**
   - Group related tests
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Test Data:**
   - Use factories for test data
   - Clean up after tests
   - Isolate test data

3. **Mocking:**
   - Mock external dependencies
   - Use realistic mock data
   - Test both success and error cases

4. **Coverage:**
   - Aim for 80%+ code coverage
   - Focus on critical paths
   - Test edge cases

5. **Performance:**
   - Keep tests fast
   - Run tests in parallel
   - Use appropriate test levels