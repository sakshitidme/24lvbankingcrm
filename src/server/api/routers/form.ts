import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { mockDataService } from '@/lib/mock-data'

const FormFieldSchema = z.object({
  id: z.string(),
  fieldName: z.string(),
  fieldType: z.string(),
  requiredFor: z.string(),
  options: z.array(z.object({
    id: z.string(),
    option: z.string(),
    value: z.string(),
    nestedFields: z.array(z.any()).optional(),
  })).optional(),
})

export const formRouter = createTRPCRouter({
  // Get all forms
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        bankId: z.string().optional(),
        isDefaultForm: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Use mock data if database is not available
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
        console.log('Using mock data for forms.getAll')
        return mockDataService.getForms(input)
      }

      const { page, limit, search, bankId, isDefaultForm } = input
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}
      
      if (search) {
        where.formName = { contains: search, mode: 'insensitive' }
      }

      if (bankId) {
        where.bankId = bankId
      }

      if (isDefaultForm !== undefined) {
        where.isDefaultForm = isDefaultForm
      }

      const [forms, total] = await Promise.all([
        ctx.db.form.findMany({
          where,
          include: {
            bank: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
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
        ctx.db.form.count({ where }),
      ])

      return {
        forms,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      }
    }),

  // Get form by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.db.form.findUnique({
        where: { id: input.id },
        include: {
          bank: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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

      if (!form) {
        throw new Error('Form not found')
      }

      return form
    }),

  // Create new form
  create: protectedProcedure
    .input(
      z.object({
        formName: z.string().min(1),
        description: z.string().optional(),
        fields: z.array(FormFieldSchema).default([]),
        isDefaultForm: z.boolean().default(false),
        bankId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use mock data if database is not available
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
        console.log('Using mock data for forms.create', input)
        return mockDataService.createForm(input)
      }

      // Check if user has permission to create forms
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isBankUser = ctx.session.user.bankId && input.bankId === ctx.session.user.bankId

      if (!isAdmin && !isBankUser) {
        throw new Error('Unauthorized to create forms')
      }

      const form = await ctx.db.form.create({
        data: {
          formName: input.formName,
          fields: input.fields,
          isDefaultForm: input.isDefaultForm,
          bankId: input.bankId,
          userId: ctx.session.user.id,
        },
        include: {
          bank: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return form
    }),

  // Update form
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        formName: z.string().min(1),
        fields: z.array(FormFieldSchema),
        isDefaultForm: z.boolean(),
        bankId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if user has permission to update this form
      const existingForm = await ctx.db.form.findUnique({
        where: { id },
        include: { bank: true },
      })

      if (!existingForm) {
        throw new Error('Form not found')
      }

      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isOwner = existingForm.userId === ctx.session.user.id
      const isBankUser = ctx.session.user.bankId && existingForm.bankId === ctx.session.user.bankId

      if (!isAdmin && !isOwner && !isBankUser) {
        throw new Error('Unauthorized to update this form')
      }

      const form = await ctx.db.form.update({
        where: { id },
        data: updateData,
        include: {
          bank: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return form
    }),

  // Delete form
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if form has any requests
      const form = await ctx.db.form.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              requests: true,
            },
          },
        },
      })

      if (!form) {
        throw new Error('Form not found')
      }

      if (form._count.requests > 0) {
        throw new Error('Cannot delete form with existing requests')
      }

      // Check permissions
      const isAdmin = ctx.session.user.permissions?.includes('admin')
      const isOwner = form.userId === ctx.session.user.id

      if (!isAdmin && !isOwner) {
        throw new Error('Unauthorized to delete this form')
      }

      await ctx.db.form.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get forms for bank
  getForBank: protectedProcedure
    .input(z.object({ bankId: z.string() }))
    .query(async ({ ctx, input }) => {
      const forms = await ctx.db.form.findMany({
        where: {
          OR: [
            { bankId: input.bankId },
            { isDefaultForm: true },
          ],
        },
        include: {
          bank: true,
          _count: {
            select: {
              requests: true,
            },
          },
        },
        orderBy: [
          { isDefaultForm: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      return forms
    }),

  // Duplicate form
  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newName: z.string().min(1),
        bankId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const originalForm = await ctx.db.form.findUnique({
        where: { id: input.id },
      })

      if (!originalForm) {
        throw new Error('Form not found')
      }

      const duplicatedForm = await ctx.db.form.create({
        data: {
          formName: input.newName,
          fields: originalForm.fields as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          isDefaultForm: false,
          bankId: input.bankId,
          userId: ctx.session.user.id,
        },
        include: {
          bank: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return duplicatedForm
    }),
})