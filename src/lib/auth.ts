import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "./db"
import { findMockUser } from "./mock-auth"

export const authOptions: NextAuthOptions = {
  adapter: process.env.MOCK_AUTH === "true" ? undefined : PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        console.log('MOCK_AUTH env var:', process.env.MOCK_AUTH)
        console.log('Attempting login with:', credentials.email)

        // Use mock authentication if enabled
        if (process.env.MOCK_AUTH === "true") {
          const mockUser = findMockUser(credentials.email, credentials.password)
          if (mockUser) {
            return {
              id: mockUser.id,
              email: mockUser.email,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              permissions: mockUser.permissions,
              bankId: mockUser.bankId,
              bank: mockUser.bank,
              walletBalance: mockUser.walletBalance
            }
          }
          return null
        }

        // Regular database authentication
        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              bank: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          if (!user.isActive) {
            return null
          }

          // Update last login date
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginDate: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            permissions: user.permissions,
            bankId: user.bankId,
            bank: user.bank,
            walletBalance: user.walletBalance || 0
          }
        } catch (error) {
          console.error('Database authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.permissions = user.permissions
        token.bankId = user.bankId
        token.bank = user.bank
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.permissions = token.permissions as string[]
        session.user.bankId = token.bankId as string
        session.user.bank = token.bank as { id: string; name: string } | null
      }
      return session
    },
  },
}