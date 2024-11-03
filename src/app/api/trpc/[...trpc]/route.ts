import { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext, testRouter } from "@/utils/trpc";
import { appRouter } from "@/server/trpc-middlewares/router";

const handler = (request: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createContext,
  });
};

export { handler as GET, handler as POST };
