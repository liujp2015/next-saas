import { getServerSession } from "@/server/auth";
import { TRPCError, createCallerFactory, initTRPC } from "@trpc/server";
import { Session } from "next-auth";
import { headers } from "next/headers";
import { db } from "../db/db";

// export async function createTRPCContext() {
//   const session = await getServerSession();

//   return {
//     session,
//   };
// }

// const t = initTRPC.context<typeof createTRPCContext>().create();

const t = initTRPC.context().create();
const { router, procedure } = t;

export const withLoggerProcedure = procedure.use(async ({ ctx, next }) => {
  const start = Date.now();
  const result = await next();
  console.log("---> Api time:", Date.now() - start);
  return result;
});

export const withSessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await getServerSession();
  return next({
    ctx: {
      session,
    },
  });
});

export const protectedProcedure = withLoggerProcedure
  .use(withSessionMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }
    return next({
      ctx: {
        session: ctx.session!,
      },
    });
  });

export const withAppProcedure = withLoggerProcedure.use(
  async ({ ctx, next }) => {
    const request = ctx;
    const header = headers();

    const apiKey = header.get("api-key");

    if (!apiKey) {
      throw new TRPCError({
        code: "FORBIDDEN",
      });
    }

    const apiKeyAndAppUser = await db.query.apiKeys.findFirst({
      where: (apiKeys, { eq, and, isNotNull }) =>
        and(eq(apiKeys.key, apiKey), isNotNull(apiKeys.deletedAt)),
      with: {
        app: {
          with: {
            user: true,
          },
        },
      },
    });
    if (!apiKeyAndAppUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return next({
      ctx: {
        app: apiKeyAndAppUser.app,
        user: apiKeyAndAppUser.app.user,
      },
    });
  }
);

export { router };
