import { getServerSession } from "@/server/auth";
import { initTRPC, TRPCError } from "@trpc/server";

export async function createContext() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  return {
    session,
  };
}

const t = initTRPC.context<typeof createContext>().create();

const middleware = t.middleware(async ({ ctx, next }) => {
  const start = Date.now();

  const result = await next();

  console.log("---> Api time:", Date.now() - start);

  return result;
});

const { router, procedure, createCallerFactory } = t;
const logProcedure = procedure.use(middleware);

export const testRouter = router({
  hello: logProcedure.query(async ({ ctx }) => {
    console.log(ctx.session);
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve(null);
    //   }, 1000);
    // });

    return {
      hello: "world",
    };
  }),
});
// const checkLoginMiddleware = t.middleware(async ({ ctx, next }) => {
//   if (!ctx.session?.user) {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//     });
//   }

//   return next();
// });

// const protectedProcedure = procedure.use(checkLoginMiddleware);

export type TestRouter = typeof testRouter;

export const serverCaller = createCallerFactory(testRouter);

// 1. create a caller-function for your router
const createCaller = createCallerFactory(testRouter);

// 2. create a caller using your `Context`
export const caller = createCaller(createContext);
