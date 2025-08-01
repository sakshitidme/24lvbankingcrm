import { createTRPCRouter } from '@/server/api/trpc'
import { userRouter } from '@/server/api/routers/user'
import { bankRouter } from '@/server/api/routers/bank'
import { formRouter } from '@/server/api/routers/form'
import { requestRouter } from '@/server/api/routers/request'

export const appRouter = createTRPCRouter({
  user: userRouter,
  bank: bankRouter,
  form: formRouter,
  request: requestRouter,
})

export type AppRouter = typeof appRouter