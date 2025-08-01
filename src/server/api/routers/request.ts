import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/server/api/trpc'
import { mockDataService } from '@/lib/mock-data'

const RequestFieldSchema = z.object({
  id: z.string(),
  fieldName: z.string(),
  fieldValue: z.string(),
  fieldType: z.string(),
  requiredFor: z.string(),
  options: z.array(z.object({
    id: z.string(),
    option: z.string(),
    value: z.string(),
    nestedFields: z.array(z.record(z.unknown())).optional(),
  })).optional(),
})

export const requestRouter = createTRPCRouter({
  // Get all requests
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
        forWhom: z.string().optional(),
        bankId: z.string().optional(),
        assignedTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, status, forWhom, bankId, assignedTo } = input
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      
      // Filter by user permissions
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isValuator = ctx.session.user.permissions?.includes('valuator')
      const isAdvocate = ctx.session.user.permissions?.includes('advocate')
      
      if (!isAdmin) {
        if (isValuator) {
          where.OR = [
            { assignedValuator: ctx.session.user.id },
            { forWhom: 'valuator' },
            { forWhom: 'both' },
          ]
        } else if (isAdvocate) {
          where.OR = [
            { assignedAdvocate: ctx.session.user.id },
            { forWhom: 'advocate' },
            { forWhom: 'both' },
          ]
        } else if (ctx.session.user.bankId) {
          where.bankId = ctx.session.user.bankId
        } else {
          where.createdBy = ctx.session.user.id
        }
      }

      if (status) {
        where.requestStatus = status
      }

      if (forWhom) {
        where.forWhom = forWhom
      }

      if (bankId) {
        where.bankId = bankId
      }

      if (assignedTo) {
        where.OR = [
          { assignedValuator: assignedTo },
          { assignedAdvocate: assignedTo },
        ]
      }

      const [requests, total] = await Promise.all([
        ctx.db.request.findMany({
          where,
          include: {
            form: true,
            bank: true,
            bankBranch: true,
            createdByUser: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            valuator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            advocate: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.request.count({ where }),
      ])

      return {
        requests,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      }
    }),

  // Get request by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.db.request.findUnique({
        where: { id: input.id },
        include: {
          form: true,
          bank: true,
          bankBranch: true,
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNo: true,
            },
          },
          valuator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNo: true,
            },
          },
          advocate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNo: true,
            },
          },
        },
      })

      if (!request) {
        throw new Error('Request not found')
      }

      // Check if user has permission to view this request
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isOwner = request.createdBy === ctx.session.user.id
      const isAssigned = request.assignedValuator === ctx.session.user.id || 
                       request.assignedAdvocate === ctx.session.user.id
      const isBankUser = ctx.session.user.bankId === request.bankId

      if (!isAdmin && !isOwner && !isAssigned && !isBankUser) {
        throw new Error('Unauthorized to view this request')
      }

      return request
    }),

  // Create new request
  create: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        fields: z.array(RequestFieldSchema),
        forWhom: z.enum(['advocate', 'valuator', 'both']),
        bankId: z.string(),
        bankBranchesId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to create requests for this bank
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isBankUser = ctx.session.user.bankId === input.bankId

      if (!isAdmin && !isBankUser) {
        throw new Error('Unauthorized to create requests for this bank')
      }

      const request = await ctx.db.request.create({
        data: {
          formId: input.formId,
          fields: input.fields as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          forWhom: input.forWhom,
          bankId: input.bankId,
          bankBranchesId: input.bankBranchesId,
          createdBy: ctx.session.user.id,
          requestStatus: 'pending',
        },
        include: {
          form: true,
          bank: true,
          bankBranch: true,
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return request
    }),

  // Update request
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fields: z.array(RequestFieldSchema).optional(),
        requestStatus: z.string().optional(),
        assignedValuator: z.string().optional(),
        assignedAdvocate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if user has permission to update this request
      const existingRequest = await ctx.db.request.findUnique({
        where: { id },
      })

      if (!existingRequest) {
        throw new Error('Request not found')
      }

      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isOwner = existingRequest.createdBy === ctx.session.user.id
      const isAssigned = existingRequest.assignedValuator === ctx.session.user.id || 
                        existingRequest.assignedAdvocate === ctx.session.user.id

      if (!isAdmin && !isOwner && !isAssigned) {
        throw new Error('Unauthorized to update this request')
      }

      // Type cast fields if present
      const processedUpdateData = {
        ...updateData,
        ...(updateData.fields && { fields: updateData.fields as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      const request = await ctx.db.request.update({
        where: { id },
        data: processedUpdateData,
        include: {
          form: true,
          bank: true,
          bankBranch: true,
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          valuator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          advocate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return request
    }),

  // Assign request to valuator/advocate
  assign: adminProcedure
    .input(
      z.object({
        requestId: z.string(),
        assignedValuator: z.string().optional(),
        assignedAdvocate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, assignedValuator, assignedAdvocate } = input

      const request = await ctx.db.request.update({
        where: { id: requestId },
        data: {
          assignedValuator,
          assignedAdvocate,
          requestStatus: 'assigned',
        },
        include: {
          form: true,
          bank: true,
          bankBranch: true,
          createdByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          valuator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          advocate: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return request
    }),

  // Delete request
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.request.findUnique({
        where: { id: input.id },
      })

      if (!request) {
        throw new Error('Request not found')
      }

      // Check permissions
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isOwner = request.createdBy === ctx.session.user.id

      if (!isAdmin && !isOwner) {
        throw new Error('Unauthorized to delete this request')
      }

      await ctx.db.request.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get dashboard statistics
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Use mock data if database is not available
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
      console.log('Using mock data for request.getDashboardStats')
      return mockDataService.getDashboardStats()
    }

    const isAdmin = ctx.session.user.permissions?.includes('admin')
    const isValuator = ctx.session.user.permissions?.includes('valuator')
    const isAdvocate = ctx.session.user.permissions?.includes('advocate')

    const where: Record<string, unknown> = {}

    if (!isAdmin) {
      if (isValuator) {
        where.OR = [
          { assignedValuator: ctx.session.user.id },
          { forWhom: 'valuator' },
          { forWhom: 'both' },
        ]
      } else if (isAdvocate) {
        where.OR = [
          { assignedAdvocate: ctx.session.user.id },
          { forWhom: 'advocate' },
          { forWhom: 'both' },
        ]
      } else if (ctx.session.user.bankId) {
        where.bankId = ctx.session.user.bankId
      } else {
        where.createdBy = ctx.session.user.id
      }
    }

    const [
      totalRequests,
      pendingRequests,
      assignedRequests,
      completedRequests,
      returnedRequests,
    ] = await Promise.all([
      ctx.db.request.count({ where }),
      ctx.db.request.count({ where: { ...where, requestStatus: 'pending' } }),
      ctx.db.request.count({ where: { ...where, requestStatus: 'assigned' } }),
      ctx.db.request.count({ where: { ...where, requestStatus: 'completed' } }),
      ctx.db.request.count({ where: { ...where, requestStatus: 'returned' } }),
    ])

    return {
      totalRequests,
      pendingRequests,
      assignedRequests,
      completedRequests,
      returnedRequests,
    }
  }),
})