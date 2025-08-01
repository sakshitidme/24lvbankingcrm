import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      permissions: string[]
      bankId: string
      bank?: {
        id: string
        name: string
      } | null
      walletBalance: number
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    permissions: string[]
    bankId: string
    bank?: {
      id: string
      name: string
    } | null
    walletBalance: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    permissions: string[]
    bankId: string
    bank?: {
      id: string
      name: string
    } | null
  }
}