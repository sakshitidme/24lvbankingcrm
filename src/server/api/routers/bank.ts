import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/server/api/trpc'
import { mockDataService } from '@/lib/mock-data'

export const bankRouter = createTRPCRouter({
  // Get all banks
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Use mock data if database is not available
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
        console.log('Using mock data for bank.getAll')
        return mockDataService.getBanks(input)
      }

      const { page, limit, search } = input
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      
      if (search) {
        where.name = { contains: search, mode: 'insensitive' }
      }

      const [banks, total] = await Promise.all([
        ctx.db.bank.findMany({
          where,
          include: {
            branches: true,
            _count: {
              select: {
                users: true,
                requests: true,
                forms: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.bank.count({ where }),
      ])

      return {
        banks,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      }
    }),

  // Get bank by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bank = await ctx.db.bank.findUnique({
        where: { id: input.id },
        include: {
          branches: true,
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              permissions: true,
              isActive: true,
            },
          },
          forms: true,
          requests: {
            include: {
              createdByUser: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })

      if (!bank) {
        throw new Error('Bank not found')
      }

      return bank
    }),

  // Create new bank (admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bank = await ctx.db.bank.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
        include: {
          branches: true,
        },
      })

      return bank
    }),

  // Update bank
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const bank = await ctx.db.bank.update({
        where: { id },
        data: updateData,
        include: {
          branches: true,
        },
      })

      return bank
    }),

  // Delete bank (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if bank has any users or requests
      const bank = await ctx.db.bank.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              users: true,
              requests: true,
            },
          },
        },
      })

      if (!bank) {
        throw new Error('Bank not found')
      }

      if (bank._count.users > 0 || bank._count.requests > 0) {
        throw new Error('Cannot delete bank with existing users or requests')
      }

      await ctx.db.bank.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get bank branches
  getBranches: protectedProcedure
    .input(
      z.object({
        bankId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { bankId, page, limit, search } = input
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = { bankId }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [branches, total] = await Promise.all([
        ctx.db.bankBranch.findMany({
          where,
          include: {
            bank: true,
            _count: {
              select: {
                requests: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.bankBranch.count({ where }),
      ])

      return {
        branches,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      }
    }),

  // Create bank branch
  createBranch: adminProcedure
    .input(
      z.object({
        bankId: z.string(),
        name: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const branch = await ctx.db.bankBranch.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          bank: true,
        },
      })

      return branch
    }),

  // Update bank branch
  updateBranch: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const branch = await ctx.db.bankBranch.update({
        where: { id },
        data: updateData,
        include: {
          bank: true,
        },
      })

      return branch
    }),

  // Delete bank branch
  deleteBranch: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if branch has any requests
      const branch = await ctx.db.bankBranch.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              requests: true,
            },
          },
        },
      })

      if (!branch) {
        throw new Error('Branch not found')
      }

      if (branch._count.requests > 0) {
        throw new Error('Cannot delete branch with existing requests')
      }

      await ctx.db.bankBranch.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})