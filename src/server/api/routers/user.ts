import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/server/api/trpc'
import { mockDataService } from '@/lib/mock-data'

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        bank: true,
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    return user
  }),

  // Get all users (admin only)
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        bankId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Use mock data if database is not available
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
        console.log('Using mock data for user.getAll')
        return mockDataService.getUsers(input)
      }

      const { page, limit, search, permissions, bankId } = input
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNo: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (permissions && permissions.length > 0) {
        where.permissions = { hasSome: permissions }
      }

      if (bankId) {
        where.bankId = bankId
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          include: {
            bank: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.user.count({ where }),
      ])

      return {
        users,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      }
    }),

  // Create new user (admin only)
  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        phoneNo: z.string().min(10),
        alternatePhone: z.string().optional(),
        designation: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        fullAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        dob: z.string().optional(),
        permissions: z.array(z.string()),
        bankId: z.string().optional(),
        bankIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 12)

      const user = await ctx.db.user.create({
        data: {
          ...input,
          password: hashedPassword,
          bankIds: input.bankIds || [],
        },
        include: {
          bank: true,
        },
      })

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  // Update user
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phoneNo: z.string().optional(),
        alternatePhone: z.string().optional(),
        designation: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        fullAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        dob: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        bankId: z.string().optional(),
        bankIds: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if user can update this profile
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      if (!isAdmin && ctx.session.user.id !== id) {
        throw new Error('Unauthorized')
      }

      const user = await ctx.db.user.update({
        where: { id },
        data: updateData,
        include: {
          bank: true,
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password2, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  // Delete user (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // Update wallet balance
  updateWalletBalance: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit']),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, amount, type, description } = input

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await ctx.db.$transaction(async (tx: any) => {
        // Get current user
        const user = await tx.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new Error('User not found')
        }

        const currentBalance = Number(user.walletBalance)
        const transactionAmount = type === 'debit' ? -Math.abs(amount) : Math.abs(amount)
        const newBalance = currentBalance + transactionAmount

        if (newBalance < 0) {
          throw new Error('Insufficient wallet balance')
        }

        // Update user wallet balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        })

        // Create wallet transaction record
        await tx.walletTransaction.create({
          data: {
            userId,
            amount: Math.abs(amount),
            type,
            description: description || `Wallet ${type}`,
            status: 'completed',
          },
        })

        return updatedUser
      })
    }),
})