import { initTRPC, TRPCError } from '@trpc/server'
import { type Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { mockSession } from '@/lib/mock-session'

type CreateContextOptions = {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  }
}

export const createTRPCContext = async () => {
  // Check if mock auth is enabled for development
  console.log('Creating TRPC context:', {
    NODE_ENV: process.env.NODE_ENV,
    MOCK_AUTH: process.env.MOCK_AUTH,
  })
  
  if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
    console.log('Using mock session')
    return createInnerTRPCContext({
      session: mockSession as Session,
    })
  }

  const session = await getServerSession(authOptions)
  console.log('Using real session:', session)

  return createInnerTRPCContext({
    session,
  })
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  
  const permissions = ctx.session.user.permissions || []
  if (!permissions.includes('admin')) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = t.procedure.use(enforceUserIsAdmin)